const res = await fetch('/firebase-config');
const firebaseConfig = await res.json();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDoc, setDoc, updateDoc, getFirestore, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const email = localStorage.getItem("userEmail");
const userRef = doc(db, "users", email);

async function saveEntry() {
    const dateInput = document.getElementById("entryDate");
    const entryInput = document.getElementById("entryBox");
    const date = dateInput.value.trim(); 
    const entry = entryInput.value.trim(); 

    if (!date || !entry) {
        alert("Date and entry required!");
        return;
    }

    try {
        const fieldPath = `dates.${date}.entry`;
        await updateDoc(userRef, {
            [fieldPath]: entry,
        });

        dateInput.value = "";
        entryInput.value = "";
        loadEntries();

    } catch (e) {
        console.error("Error saving entry:", e);
    }
}

async function loadEntries() {
    const journalList = document.getElementById("journalList");
    journalList.innerHTML = ""; 

    try {
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const dates = data.dates || {};

            Object.keys(dates).forEach(date => {//dates.forEach(date => {
                const li = document.createElement("li");
                li.textContent = `${date}: ${dates[date].entry}`;
                journalList.appendChild(li) + "\n";
            });
        } else {
            console.log("No entries found.");
        }
    } catch (e) {
        console.error("Error loading entries:", e);
    }
}

document.addEventListener("DOMContentLoaded", loadEntries);
window.saveEntry = saveEntry;
