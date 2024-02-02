import React, { useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/config';
import { useRouter } from 'next/router';

const Register = () => {
    const router = useRouter()
    const signInWithGoogle = async () => {
        //const token = localStorage.getItem('token');
        try {
            signInWithPopup(auth, provider)
                .then(async (result) => {
                    console.log(result.user);
                    result.user.getIdToken().then(async (token) => {
                        localStorage.setItem('token', token);
                        console.log(token);
                        router.push('/')
                    }).catch((error) => {
                        console.error("Could not get the token", error);
                    })
                }).catch((error) => {
                    // Handle Errors here.
                    console.log(error);
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // The email of the user's account used.
                    // The AuthCredential type that was used.
                    const credential = GoogleAuthProvider.credentialFromError(error);
                    // ...
                });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="mt-8 space-y-6">
                    <button onClick={signInWithGoogle} className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                    >
                        Sign In with Google
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;
