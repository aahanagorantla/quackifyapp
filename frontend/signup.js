const res = await fetch('/firebase-config');
const firebaseConfig = await res.json();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("signupform").onsubmit = async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try 
    {
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.length === 0) 
        {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", email), {});
            localStorage.setItem("userEmail", email);
            window.location.href = "setup.html";
        } 
        else 
            alert("This email is already registered. Sign in instead.");
    } 
    catch (error) 
    {
        alert("This email is already registered. Sign in instead.");
    }
};