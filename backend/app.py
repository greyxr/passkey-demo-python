import uuid
from flask import Flask, send_from_directory, session, request, redirect, abort, jsonify
from random import randbytes
import os
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    verify_authentication_response,
    verify_registration_response,
    options_to_json,
    base64url_to_bytes,
)
from webauthn.helpers.cose import COSEAlgorithmIdentifier
from webauthn.helpers.structs import (
    PublicKeyCredentialDescriptor,
    AuthenticatorSelectionCriteria,
    ResidentKeyRequirement
)
import base64

# Database setup
import sqlite3

# Initialize SQLite database
DATABASE_PATH = "./passkey_demo.db"

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    # Create a table for storing user information
    # cursor.execute("DROP TABLE IF EXISTS users;")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id UUID NOT NULL,
            identifier TEXT NOT NULL,
            public_key TEXT,
            credential_id TEXT NOT NULL,
            credential_name TEXT DEFAULT '',
            sign_count INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, credential_id)
        );
    """)
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize the database when the app starts
init_db()
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')

# Set flask session secret key
SECRET_KEY = os.urandom(24)
app.secret_key = SECRET_KEY

@app.route("/register/begin", methods=["POST"])
def register_begin():
    # Check for identifier in the post body
    data = request.get_json()
    if not data or "identifier" not in data:
        identifier = str(uuid.uuid4())
    else:
        identifier = data["identifier"]

    # Get user ID if exists
    credentials = get_credential(identifier, "identifier")
    if len(credentials):
        user_id = credentials[0]["user_id"]
        user_id = uuid.UUID(user_id)
    else:
        user_id = uuid.uuid4()

    # Get already used credentials
    credential_id_list = []
    if (len(credentials)):
        for row in credentials:
            credential_id_list.append(PublicKeyCredentialDescriptor(id=row["credential_id"]))

    challenge = randbytes(32)
    print("Challenge:", challenge)
    simple_registration_options = generate_registration_options(
        rp_id="localhost",
        rp_name="Example Co",
        user_name=identifier,
        user_display_name=identifier,
        user_id=user_id.bytes,
        supported_pub_key_algs=[
            COSEAlgorithmIdentifier.ECDSA_SHA_256,
            COSEAlgorithmIdentifier.RSASSA_PKCS1_v1_5_SHA_256,
            COSEAlgorithmIdentifier.EDDSA
        ],
        challenge=challenge,
        exclude_credentials=credential_id_list,
        authenticator_selection=AuthenticatorSelectionCriteria(resident_key=ResidentKeyRequirement.REQUIRED, require_resident_key=True)
    )

    print("user_id:", user_id)
    print("\n[Registration Options - Simple]")
    print(options_to_json(simple_registration_options))

    # Save challenge to session
    session[str(user_id)] = challenge
    return options_to_json(simple_registration_options)

@app.route("/register/complete", methods=["POST"])
def register_complete():
    # Check for user_id in the post body
    data = request.get_json()
    if not data or "user_id" not in data or "response" not in data or "identifier" not in data:
        return abort(400, "Invalid request")
    
    # Convert user_id to UUID
    try:
        user_id_bytes = base64url_to_bytes(data["user_id"])
        user_id = uuid.UUID(bytes=user_id_bytes)
    except ValueError as e:
        print(f"Error converting user_id: {e}")
        return abort(400, "Invalid user ID or identifier format")
    print("User ID (UUID):", user_id)
    identifier = data["identifier"]
    print("Identifier:", identifier)

    registration_response = data["response"]

    # Verify registration response
    challenge = session.pop(str(user_id), None)
    if challenge is None:
        print("No challenge found")
        return abort(400, "No challenge found in session")
    
    # print("Challenge:", challenge)
    # print("Registration response:")
    # print(registration_response)

    try:
        registration_verification = verify_registration_response(
            credential=registration_response,
            expected_challenge=challenge,
            expected_rp_id="localhost",
            expected_origin="http://localhost:5000",
            require_user_verification=False,
                    supported_pub_key_algs=[
            COSEAlgorithmIdentifier.ECDSA_SHA_256,
            COSEAlgorithmIdentifier.RSASSA_PKCS1_v1_5_SHA_256,
            COSEAlgorithmIdentifier.EDDSA
        ]
        )
    except Exception as e:
        print(f"Verification error: {e}")
        return abort(400, "Verification failed")
    
    # Check for existing credential_ids in the database
    credential = get_credential(str(user_id), "user_id")
    for row in credential:
        if row["credential_id"] == registration_verification.credential_id:
            return abort(400, "Credential already exists")

    # Save public key to database
    try:
        print("Saving credential_id:")
        print(registration_verification)
        conn = get_db_connection()
        cursor = conn.cursor()
        # Ignore encrypting key and saving credential name for now
        cursor.execute("INSERT INTO users (user_id, identifier, public_key, credential_id, credential_name, sign_count) VALUES (?, ?, ?, ?, ?, ?)",
                       (str(user_id), identifier, registration_verification.credential_public_key, registration_verification.credential_id, "", registration_verification.sign_count))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return abort(500, "Database error")

    return {"status": "success", "identifier": identifier}


@app.route("/authenticate/begin", methods=["POST"])
def authenticate_begin():
    # Generate session ID to track challenge
    session_id = uuid.uuid4()
    challenge = randbytes(32)
    print("Challenge:", challenge)
    authentication_options = generate_authentication_options(
        rp_id="localhost",
        challenge=challenge,
        # allow_credentials=credential_id_list
    )

    print("session_id:", session_id)
    print("\n[Authentication Options - Simple]")
    print(options_to_json(authentication_options))

    # Save challenge to session
    session[str(session_id)] = challenge
    return {"session_id": session_id, "options": options_to_json(authentication_options)}

@app.route("/authenticate/complete", methods=["POST"])
def authenticate_complete():
    # Check for session_id in the post body
    data = request.get_json()
    if not data or "response" not in data or "session_id" not in data:
        return abort(400, "Invalid request")
    
    print("Response:")
    print(data["response"])
    session_id = data["session_id"]
    
    # Get user id, challenge, and matching credential row
    print("Getting user_id")
    received_credential_id = base64url_to_bytes(data["response"]["id"])
    user_id_string = data["response"]["response"]["userHandle"]
    print("userId:")
    print(user_id_string)
    # UserID needs to be turned back to string here
    user_id_bytes = base64.urlsafe_b64decode(user_id_string + '==')
    user_id = uuid.UUID(bytes=user_id_bytes)
    print("user_id: ", user_id)

    credential_rows = get_credential(str(user_id), "user_id")
    credential = None

    for cred in credential_rows:
        if cred["credential_id"] == received_credential_id:
            credential = cred
    
    # If no matching credential is found, return
    # Not sure if this is the best way to do this
    if credential is None:
        return abort(400, "Credential ID not found")
    

    challenge = session.pop(str(session_id), None)
    if challenge is None:
        print("No challenge found")
        return abort(400, "No challenge found in session")
    
    # Authenticate response
    try:
        authentication_verification = verify_authentication_response(
            credential=data["response"],
            expected_challenge=challenge,
            expected_rp_id="localhost",
            expected_origin="http://localhost:5000",
            require_user_verification=False,
            credential_public_key=credential["public_key"],
            credential_current_sign_count=credential["sign_count"]
        )
    except Exception as e:
        print(f"Verification error: {e}")
        return abort(400, "Verification failed")
    
    return {"status": "success", "identifier": credential["identifier"]}
    

def get_credential(id, id_type):
    if id_type not in {"user_id", "identifier"}:
        return abort(400, "Bad Request")
    try:
        conn = get_db_connection()
        cursor = conn.cursor() # Should be fine to use formatted string here; it's only ever hardcoded
        response = cursor.execute(f"SELECT * FROM users WHERE {id_type} = (?)",
                       (id,)).fetchall()
        conn.close()
        if (len(response) == 0):
            return []
        else:
            return [dict(row) for row in response]
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return abort(500, "Database error")
    

@app.route("/passkeys/<identifier>", methods=["GET"])
def get_saved_passkeys(identifier):
    passkeys = get_credential(identifier, "identifier")
    print("Returning saved passkeys")
    print(passkeys)
    print(identifier)
    # Don't do this. Who writes this garbage?
    for key in passkeys:
        del key["public_key"]
        del key["user_id"]
        del key["sign_count"]
        key["credential_id"] = base64.urlsafe_b64encode(key["credential_id"]).rstrip(b"=").decode()
    print(passkeys)
    return {"passkeys": passkeys}


# Serve React frontend - must be at the end to not interfere with API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path=''):
    # Check if the path is for a static file (has an extension)
    if path and '.' in path:
        file_path = os.path.join(app.static_folder, path)
        if os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
    
    # For all other routes, serve index.html (SPA routing)
    return send_from_directory(app.static_folder, 'index.html')

# Add a catch-all error handler for 404s to serve index.html
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')