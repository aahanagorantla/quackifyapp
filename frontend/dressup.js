const res = await fetch('/firebase-config');
const firebaseConfig = await res.json();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { doc, getDoc, setDoc, updateDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const email = localStorage.getItem("userEmail");
const docRef = doc(db, "users", email);

console.log("Firebase initialized with config:", email);


const necklaces = ["duckfits/IMG_0900.PNG", "duckfits/IMG_0918.PNG", "duckfits/IMG_0919.PNG", "duckfits/IMG_0920.PNG"];
const hats = ["duckfits/IMG_0900.PNG", "duckfits/IMG_0910.PNG", "duckfits/IMG_0911.PNG", "duckfits/IMG_0912.PNG", "duckfits/IMG_0913.PNG", "duckfits/IMG_0914.PNG", "duckfits/IMG_0915.PNG", "duckfits/IMG_0916.PNG", "duckfits/IMG_0917.PNG"];
const shirts = ["duckfits/IMG_0900.PNG", "duckfits/IMG_0905.PNG", "duckfits/IMG_0906.PNG", "duckfits/IMG_0907.PNG", "duckfits/IMG_0909.PNG"];
const shoes = ["duckfits/IMG_0900.PNG", "duckfits/IMG_0902.PNG", "duckfits/IMG_0903.PNG", "duckfits/IMG_0904.PNG"];

let nI = 0;
let hI = 0;
let siI = 0; 
let soI = 0;

async function initializeAvatarIndices() 
{
    try 
    {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || !docSnap.get("avatar"))
            await setDoc(docRef, {avatar:  {hatIndex: 0, necklaceIndex: 0, shirtIndex: 0, shoesIndex: 0, }, }, {merge: true});
    } 
    catch (e) 
    {
        console.error("Error initializing avatar:", e);
    }
}

async function loadAvatar() 
{
    try 
    {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.get("avatar"))
        {
            const indexes = docSnap.get("avatar");
            nI = indexes.necklaceIndex ?? 0;
            hI = indexes.hatIndex ?? 0;
            siI = indexes.shirtIndex ?? 0;
            soI = indexes.shoesIndex ?? 0;
        }
    } 
    catch (e) 
    {
        console.error("Error loading avatar:", e);
    }

    updateAvatar();
}

function updateAvatar() 
{
    document.getElementById("necklace").src = necklaces[nI];
    document.getElementById("hat").src = hats[hI];
    document.getElementById("shirt").src = shirts[siI];
    document.getElementById("shoes").src = shoes[soI];
}

function prevShirt() 
{
    siI--;
    if (siI < 0)
        siI = shirts.length - 1;
    updateAvatar();
}
function nextShirt() 
{
    siI++;
    if (siI >= shirts.length)
        siI = 0;
    updateAvatar();
}
function prevHat() 
{
    hI--;
    if (hI < 0)
        hI = hats.length - 1;
    updateAvatar();
}
function nextHat() 
{
    hI++;
    if (hI >= hats.length)
        hI = 0;
    updateAvatar();
}
function prevNecklace() 
{
    nI--;
    if (nI < 0)
        nI = necklaces.length - 1;
    updateAvatar();
}
function nextNecklace() 
{
    nI++;
    if (nI >= necklaces.length)
        nI = 0;
    updateAvatar();
}
function prevShoes() 
{
    soI--;
    if (soI < 0)
        soI = shoes.length - 1;
    updateAvatar();
}
function nextShoes() 
{
    soI++;
    if (soI >= shoes.length)
        soI = 0;
    updateAvatar();
}
async function reset() 
{
    nI = 0;
    hI = 0;
    siI = 0;
    soI = 0;
    updateAvatar();

    try 
    {
        await updateDoc(docRef, {
            "avatar": {
                hatIndex: hI,
                necklaceIndex: nI,
                shirtIndex: siI,
                shoesIndex: soI,
            }
        });
        console.log("Reset indices saved to Firestore");
    } 
    catch (e) 
    {
        console.error("Error saving reset avatar:", e);
    }
}


window.prevShirt = prevShirt;
window.nextShirt = nextShirt;
window.prevHat = prevHat;
window.nextHat = nextHat;
window.prevNecklace = prevNecklace;
window.nextNecklace = nextNecklace;
window.prevShoes = prevShoes;
window.nextShoes = nextShoes;
window.reset = reset;

document.addEventListener("DOMContentLoaded", async () => {
    await initializeAvatarIndices();
    await loadAvatar();

    const doneBtn = document.getElementById("done");
    if (doneBtn) {
        doneBtn.addEventListener("click", doneonclick);
        console.log("Attached event listener to Done button");
    } else {
        console.error("Done button not found!");
    }
});

async function doneonclick()
{
    console.log("Done button clicked");
    try 
    {
        console.log("Saving indices to Firestore:", { nI, hI, siI, soI });
        await updateDoc(docRef, {"avatar": {hatIndex: hI,necklaceIndex: nI,shirtIndex: siI,shoesIndex: soI,},
    });
    } 
    catch (e) 
    {
        console.error("Error saving avatar:", e);
    }
    window.location.href = "profile.html";
}