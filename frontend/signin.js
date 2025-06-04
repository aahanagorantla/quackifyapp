const res = await fetch('/firebase-config');
const firebaseConfig = await res.json();

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("signinform").onsubmit = async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try 
    {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Signed in:", user.email);
        localStorage.clear()
        localStorage.setItem("userEmail", email);
        window.location.href = "profile.html";
    } 
    catch (error) 
    {
        if (error.code === 'auth/user-not-found')
            alert("No account found with this email.");
        else if (error.code === 'auth/wrong-password')
            alert("Incorrect password. Please try again.");
        else
            alert("Error: " + error.message);

    }
};  