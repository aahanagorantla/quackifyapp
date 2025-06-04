import { doc, getDoc, getFirestore, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { firebaseConfig } from "./firebase.js";
import { collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const email = localStorage.getItem("userEmail");
const pondsContainer = document.querySelector('.ponds');

renderPonds();

async function renderPonds()
{
    pondsContainer.innerHTML = "";
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) 
    {
        const worlds = docSnap.get("worlds") || [];

        for (const world of worlds) 
            if (world.trim() !== "") 
            {
                const pond = document.createElement("div");
                pond.classList.add("pond");

                const button = document.createElement("button");
                button.classList.add("btn");
                button.textContent = `Enter ${world}`;

                button.addEventListener("click", () => {
                    enterPond(world);
                });

                pond.appendChild(button);

                pondsContainer.appendChild(pond);
            }
    }
}

pondsContainer.addEventListener('wheel', (e) => 
{
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) 
    {
        e.preventDefault();
        pondsContainer.scrollLeft += e.deltaY;
    }
}, { passive: false });

async function generateCode() 
{
    var found = false;
    
    while (!found)
    {
        const code = generateRandomCode();
        const q = query(
            collection(db, 'worlds'),
            where('code', '==', code),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) 
        {
            found = true;
            return code;
        }
    }
}

function generateRandomCode() 
{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) 
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    return code;
}

async function createpond() 
{
    document.getElementById('createpopup').style.display = 'grid';
    document.getElementById('overlay').style.display = 'block';

    const code = await generateCode();

    document.getElementById("pondcode").textContent = `Pond Code: ${code}`;
}

async function create() 
{
    const pondNameInput = document.getElementById('pondName');

    if (pondNameInput.value.trim() === '') 
    {
        alert('Please enter a Pond Name.');
        return;
    }

    const q = query(
        collection(db, 'worlds'),
        where('name', '==', pondNameInput.value.trim()),
        limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) 
    {
        alert('This name is already taken. Please choose a different Pond Name.');
        return;
    }

    document.getElementById('createpopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';

    await setDoc(doc(db, "worlds", pondNameInput.value.trim()), {
        name: pondNameInput.value.trim(),
        users: [email],
        code: document.getElementById("pondcode").textContent.split(": ")[1]
    });

    const worldRef = doc(db, "worlds", pondNameInput.value.trim());
    const worldsnap = await getDoc(worldRef)
    
    const data = worldsnap.data();
    let users = data.users || [];
    if (!users.includes(email)) 
    {
        users.push(email);
        await updateDoc(worldRef, { users });
    }

    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);
    var worlds = [];
    if (docSnap.exists()) 
        worlds = docSnap.get("worlds");
    else console.log("No such document!");

    if (!Array.isArray(worlds)) 
        worlds = [];

    worlds.push(pondNameInput.value.trim())
    try 
    {
        await updateDoc(docRef, { worlds: worlds });
    } 
    catch (e)
    {
        console.error("Error updating document: ", e);
    }

    renderPonds();

    pondNameInput.value = '';
}

function joinpond() 
{
    document.getElementById('joinpopup').style.display = 'grid';
    document.getElementById('overlay').style.display = 'block';
}

async function join() 
{
    const pondcodeinp = document.getElementById('joinpondcode');

    if (pondcodeinp.value.trim() === '')
    {
        alert('Please enter a Pond Code.');
        return;
    }

    const q = query(
        collection(db, 'worlds'),
        where('code', '==', pondcodeinp.value.trim()),
        limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) 
    {
        alert('This Pond does not exist. Please check the code and try again.');
        return;
    }

    const docData = snapshot.docs[0];
    const worldname = docData.id;

    document.getElementById('joinpopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';

    const worldRef = doc(db, "worlds", worldname);
    const worldsnap = await getDoc(worldRef);
    const worldData = worldsnap.data();

    let users = worldData.users || [];
    if (!users.includes(email)) 
    {
        users.push(email);
        await updateDoc(worldRef, { users });
    }

    const userRef = doc(db, "users", email);
    const userSnap = await getDoc(userRef);
    let worlds = userSnap.exists() ? userSnap.get("worlds") || [] : [];

    if (!worlds.includes(worldname)) 
    {
        worlds.push(worldname);
        try 
        {
            await updateDoc(userRef, { worlds });
        }
        catch (e) 
        {
            console.error("Error updating user document: ", e);
        }
    }

    renderPonds();

    pondcodeinp.value = '';
}

function backtoprofile() 
{
    window.location.href = "profile.html";
}

document.getElementById("createpond").addEventListener("click", createpond);
document.getElementById("joinpond").addEventListener("click", joinpond);
document.getElementById("backtoprofile").addEventListener("click", backtoprofile);
document.getElementById("createBtn").addEventListener("click", create);
document.getElementById("joinbtn").addEventListener("click", join);


document.getElementById("pondName").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        create();
    }
});

function enterPond(worldName) 
{
    console.log("Entering pond:", worldName);
    window.location.href = `pond.html?name=${encodeURIComponent(worldName)}`; // Redirect to the world page
    localStorage.setItem("worldName", worldName); // Store the world name in localStorage
}
