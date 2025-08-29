import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { base64urlToUint8Array, base64urlEncode } from './util';
import { useAuth } from './AuthContext';

const LoginButton = ({identifier}) => {
    const { login } = useAuth();
    async function authenticateBegin() {
        try {
            console.log("Awaiting login")
            const response = await fetch('/authenticate/begin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                })
            if (!response.ok) {
                console.log("Failed")
                toast.error("Failed to login: " + response.status, {
                    closeOnClick: true,
                    autoClose: 1000
                  })
                return
            }
            console.log("Received auth options from server")
            const options = await response.json()
            console.log(options)
            return options
        } catch (error) {
                console.log("Failed to login")
                toast.error("Failed to login: " + error, {
                    closeOnClick: true,
                    autoClose: 1000
                  })
            }
    }
    async function getCredentials(optionsStr) {
        try {
            // Decode credentials whitelist
            // options.allowCredentials[0].id = base64urlToUint8Array(options.allowCredentials[0].id)
            // options.allowCredentials = options.allowCredentials.map((cred) => ({
            //     ...cred,
            //     id: base64urlToUint8Array(cred.id)
            // }))
            // options.allowCredentials.forEach((cred) => {
            //     cred.id = base64urlToUint8Array(cred.id)
            // })
            const options = JSON.parse(optionsStr)
            console.log("Trying to get credentials with options:")
            console.log(options)
            options.challenge = base64urlToUint8Array(options.challenge)
            console.log("Encoded challenge")
            const credentials = await navigator.credentials.get({publicKey: options})
            console.log("Got credential")
            console.log(credentials)
            return credentials
        } catch (error) {
            toast.error("Failed to get credentials: " + error, {
                closeOnClick: true,
                autoClose: 1000
              })
            return null
        }

    }
    async function authenticateFinish(publicKeyCredential, sessionId) {
        console.log("Logging in with server:")
        console.log(sessionId)
        console.log(publicKeyCredential.toJSON())
        try {
        let response = await fetch('/authenticate/complete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            response: publicKeyCredential,
            "session_id": sessionId
        })})
        const result = await response.json()
        console.log("Response:");
        console.log(result)
        return result
        } catch (error){
        toast.error("Failed to login with server: " + error, {
            closeOnClick: true,
            autoClose: 1000
          });
        }
    }
    async function handleLogin() {
        const response = await authenticateBegin()
        if (!response) return
        const publicKeyCredential = await getCredentials(response.options)
        if (!publicKeyCredential) return
        const result = await authenticateFinish(publicKeyCredential, response.session_id)
        if (!result || !result.status || result.status !== "success") {
            return
        //   toast.error("Failed to login with server for unknown reasons")
        } else {
          login(result.identifier)
          navigate('/user');
        }
    }
    return (
        <>
        <button onClick={handleLogin}>
            Login
        </button>
        <ToastContainer />
        </>
    );
};

export default LoginButton;