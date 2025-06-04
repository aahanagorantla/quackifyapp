const res = await fetch('/firebase-config');
const firebaseConfig = await res.json();

import { doc, getDoc, getFirestore, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const email = localStorage.getItem("otherUserEmail");
console.log("Other user email:", email);
const docRef = doc(db, "users", email);
const docSnap = await getDoc(docRef);

const necklaces = ["duckfits/IMG_0900.PNG", "duckfits/IMG_0918.PNG", "duckfits/IMG_0919.PNG", "duckfits/IMG_0920.PNG" ];
const hats = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0910.PNG", "duckfits/IMG_0911.PNG", "duckfits/IMG_0912.PNG", "duckfits/IMG_0913.PNG", "duckfits/IMG_0914.PNG", "duckfits/IMG_0915.PNG", "duckfits/IMG_0916.PNG", "duckfits/IMG_0917.PNG" ];
const shirts = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0905.PNG", "duckfits/IMG_0906.PNG", "duckfits/IMG_0907.PNG", "duckfits/IMG_0909.PNG"];
const shoes = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0902.PNG", "duckfits/IMG_0903.PNG", "duckfits/IMG_0904.PNG" ];



var name, username, bio, pronouns, avatar, ponds;

if (docSnap.exists()) 
{
    name = docSnap.get("name");
    username = docSnap.get("username");
    bio = docSnap.get("bio");
    pronouns = docSnap.get("pronouns");
    avatar = docSnap.get("avatar");
    ponds = docSnap.get("worlds");

    if (avatar) 
    {
        document.getElementById("necklace").src = necklaces[avatar.necklaceIndex];
        document.getElementById("hat").src = hats[avatar.hatIndex];
        document.getElementById("shirt").src = shirts[avatar.shirtIndex];
        document.getElementById("shoes").src = shoes[avatar.shoesIndex];   
    }
    else{
        document.getElementById("necklace").src = "duckfits/IMG_0901.PNG";
        document.getElementById("hat").src = "duckfits/IMG_0901.PNG";
        document.getElementById("shirt").src = "duckfits/IMG_0901.PNG";
        document.getElementById("shoes").src = "duckfits/IMG_0901.PNG";
    }

} 
else console.log("No such document!");



document.getElementById("bioText").textContent = bio;

document.getElementById("name").textContent = name;
document.getElementById("username").textContent = "@" + username;
document.getElementById("pronouns").textContent = pronouns;

function gotoponds(){
    window.location.href = "choosepond.html"
}

function gotochat(){
    window.location.href = "aichat.html "
}

document.getElementById("ponds").addEventListener("click", gotoponds);
document.getElementById("chat").addEventListener("click", gotochat);

const date = new Date();
const formatted = date.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric"
});

document.getElementById("datetext").textContent += formatted;

const pondscontainer = document.querySelector(".showit");

// Clear existing content
pondscontainer.innerHTML = "";

if (ponds && Array.isArray(ponds) && ponds.length > 0) {
  ponds.forEach(pond => {
    const pondElement = document.createElement("div");
    pondElement.className = "shown";
    pondElement.textContent = pond;
    
    pondscontainer.appendChild(pondElement);
  });
} else {
  pondscontainer.textContent = "No ponds available.";
}