import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { base64urlEncode, base64urlToUint8Array } from './util';

const RegistrationButton = ({identifier}) => {
  const backendUrl = 'http://localhost:5000'
  async function getOptions() {
    // const response = await fetch(backendUrl + '/passkey-challenge/' + identifier);
    try {
      const response = await fetch(backendUrl + '/register/begin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(identifier ? {
          identifier: identifier
        }: {})})
      if (!response.ok) {
        if (response.status == 400) {
          toast.error("Username is already in use", {
            closeOnClick: true,
            autoClose: 1000
          })
        }
        return null
      }
      const optionsObj = await response.json()
      console.log("Response:")
      console.log(optionsObj)
      return optionsObj
    } catch (error) {
      console.error("Failed to get options from server")
    }
  }
  async function getPasskey(options) {
    const challenge = base64urlToUint8Array(options.challenge);
    const user_id = base64urlToUint8Array(options.user.id);
    options.challenge = challenge;
    options.user.id = user_id;
    let publicKeyCredential = null;
    options.excludeCredentials = options.excludeCredentials.map((cred) => ({
      ...cred,
      id: base64urlToUint8Array(cred.id)
    }))
    try {
      console.log("Trying to create passkey credentials with options:");
      console.log(options);
      publicKeyCredential = await navigator.credentials.create({
        // https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions
        publicKey: options
      })
    } catch(e) {
      console.log("Error calling webauthn: " + e);
      toast.error("Failed to create passkey credentials: " + e, {
        closeOnClick: true,
        autoClose: 1000
      })
      return null;
    }
  
    // possibly returns null
    if (!publicKeyCredential) {
      toast.error("CreateCredential returned null", {
        closeOnClick: true,
        autoClose: 1000
      })
      return;
    }
  
    // Encode and serialize the `PublicKeyCredential`.
    const result = publicKeyCredential.toJSON();
    // const result = JSON.stringify(_result);
    console.log("Result:");
    console.log(result);
    // Send the credential to the server for verification
    return result;

  };
  async function registerPasskeyWithServer(credential, options) {
    console.log("Registering passkey with server:")
    console.log(options)
    try {
      let response = await fetch('/register/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: options.user.name,
        user_id: base64urlEncode(options.user.id),
        response: credential
      })})
      const result = await response.json()
      console.log("Response:");
      console.log(result)
      return result
    } catch (error){
      toast.error("Failed to register passkey with server: " + error, {
        closeOnClick: true,
        autoClose: 1000
      });
    }
    return
  }
  async function register() {
    // if (!identifier) {
    //   toast.error("Please enter an identifier", {
    //     closeOnClick: true,
    //     autoClose: 2000
    //   });
    //   return
    // }
    let options = null
    options = await getOptions().catch(e => {toast.error(e, {
      closeOnClick: true,
      autoClose: 1000
    }); return null})
    if (!options) {
      return
    }
    const publicKeyCredential = await getPasskey(options)
    if (!publicKeyCredential) {
      return
    }
    const result = await registerPasskeyWithServer(publicKeyCredential, options)
    if (!result || !result.status || result.status !== "success") {
      toast.error("Failed to register with server for unknown reasons", {
        closeOnClick: true,
        autoClose: 1000
      })
    } else {
      toast.info("Registered passkey", {
        closeOnClick: true,
        autoClose: 1000
      })
    }
    return
  }
    return (
      <>
        <button onClick={register}>
            Register
        </button>
        <ToastContainer />
        </>
    );
};

export default RegistrationButton;