const res = await fetch('/firebase-config');
const firebaseConfig = await res.json();

import { doc, getDoc, getFirestore, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const email = localStorage.getItem("userEmail");
const worldname = localStorage.getItem('worldName');
var users = [];

const necklaces = ["duckfits/IMG_0900.PNG", "duckfits/IMG_0918.PNG", "duckfits/IMG_0919.PNG", "duckfits/IMG_0920.PNG"];
const hats = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0910.PNG", "duckfits/IMG_0911.PNG", "duckfits/IMG_0912.PNG", "duckfits/IMG_0913.PNG", "duckfits/IMG_0914.PNG", "duckfits/IMG_0915.PNG", "duckfits/IMG_0916.PNG", "duckfits/IMG_0917.PNG" ];
const shirts = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0905.PNG", "duckfits/IMG_0906.PNG", "duckfits/IMG_0907.PNG", "duckfits/IMG_0909.PNG"];
const shoes = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0902.PNG", "duckfits/IMG_0903.PNG", "duckfits/IMG_0904.PNG" ];

function geturl() //so it works in production
{     
    if ( window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
        return 'ws://127.0.0.1:5000'; 
    else return `wss://${window.location.hostname}:5000`;
}

const docRef = doc(db, "worlds", worldname);
const docSnap = await getDoc(docRef);
if(docSnap.exists()) users = docSnap.get("users");

const userListElement = document.getElementById("userlist");

async function renderuserlist() 
{
    if (userListElement && users.length > 0) 
    {
        userListElement.innerHTML = "";

        for (const userEmail of users) 
            try 
            {
                const userDocRef = doc(db, "users", userEmail);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) 
                {
                    const name = userDocSnap.get("name") || userEmail;
                    const username = userDocSnap.get("username") || "";
                    const base = "duckfits/IMG_0901.PNG";
                    const hat = hats[userDocSnap.get("avatar.hatIndex")];
                    const necklace = necklaces[userDocSnap.get("avatar.necklaceIndex")]
                    const shirt = shirts[userDocSnap.get("avatar.shirtIndex")]
                    const shoe = shoes[userDocSnap.get("avatar.shoesIndex")]

                    const li = document.createElement("li");

                    const avatarContainer = document.createElement("div");
                    avatarContainer.classList.add("avatar-container");

                    const layers = [
                    { src: base, className: "base" },
                    { src: shirt, className: "shirt" },
                    { src: shoe, className: "shoe" },
                    { src: necklace, className: "necklace" },
                    { src: hat, className: "hat" }
                    ];

                    for (const layer of layers) 
                        if (layer.src) 
                        {
                            const layerImg = document.createElement("img");
                            layerImg.src = layer.src;
                            layerImg.alt = name;
                            layerImg.classList.add("avatar-layer", layer.className);
                            avatarContainer.appendChild(layerImg);
                        }

                    const infoDiv = document.createElement("div");
                    infoDiv.classList.add("user-info");

                    const nameSpan = document.createElement("span");
                    nameSpan.textContent = name;
                    nameSpan.classList.add("user-name");

                    const usernameSpan = document.createElement("span");
                    usernameSpan.textContent = "@" + username;
                    usernameSpan.classList.add("user-username");

                    infoDiv.appendChild(nameSpan);
                    infoDiv.appendChild(usernameSpan);

                    li.appendChild(avatarContainer);
                    li.appendChild(infoDiv);

                    if (userEmail != email) 
                        li.addEventListener("click", () => {
                            window.location.href = `otherprofile.html?email=${encodeURIComponent(userEmail)}`;
                            localStorage.setItem("otherUserEmail", userEmail);
                        });
                    else li.classList.add("current-user");

                    userListElement.appendChild(li);
                }
            } 
            catch (error) 
            {
                console.error("Error fetching user doc:", error);
            }
    }
}

renderuserlist();

if (docSnap.exists()) 
{
    users = docSnap.get("users");
    const posts = docSnap.get("posts") || [];
    await renderPosts(posts);

    const name = docSnap.get("name") || worldname;
    const worldcode = docSnap.get("worldcode") || "NONE";
    document.getElementById("world-name").textContent = `🌎 World: ${name}`;
    document.getElementById("world-code").textContent = `🔑 Code: ${worldcode}`;
}

document.getElementById("postbutton").addEventListener("click", post);

const socket = new WebSocket(geturl());

socket.addEventListener('message', function (event) 
{
    const output = document.getElementById("output");
    console.log('Message from server ', event.data);

    if (event.data instanceof Blob) 
    {
        event.data.text().then(text => {
            console.log('Message from server:', text);
            output.innerHTML = text + output.innerHTML;
        }).catch(error => {
            console.error('Error reading Blob:', error);
        });
    } 
    else output.innerHTML = event.data + output.innerHTML;
});

async function post()
{
    const postContent = document.getElementById("postinput").value
    const user = localStorage.getItem("userEmail");
    const userDocRef = doc(db, "users", user);
    const userDocSnap = await getDoc(userDocRef);
    var name = ""
    
    if (userDocSnap.exists()) 
        name = userDocSnap.get("name") || userEmail;

    if (postContent.trim() === "") 
    {
        alert("Post content cannot be empty.");
        return;
    }

    const newPost = `
    <div class="tweet">
        <div class="tweet-header">
            <strong class="tweet-name">${name}</strong>
            <span class="tweet-handle">@${userDocSnap.get("username") || "user"}</span>
        </div>
        <div class="tweet-body">${postContent}</div>
        <div class="tweet-actions">
            <button class="action-btn like-btn">❤️ <span class="like-count">0</span></button>
        </div>
    </div>
    `;

    document.getElementById("postinput").value = "";

    socket.send(newPost);

    const docref = doc(db, "worlds", worldname);

    try 
    {
        await updateDoc(docref, {
            posts: arrayUnion({ user: email, post: postContent, likes: 0})
        });
    } 
  catch (error) {
    console.error("Error adding field: ", error);
  }

}

document.getElementById("postinput").addEventListener('keydown', function(event) 
{
    if (event.key === 'Enter'  ) 
        document.getElementById("postbutton").click();
});

document.getElementById("addtodolist").addEventListener("click", async () => 
{
    const postinputElement = document.getElementById("postinput");

    const user = localStorage.getItem("userEmail");
    const userDocRef = doc(db, "users", user);
    const userDocSnap = await getDoc(userDocRef);

    let todolist = [];
    if (userDocSnap.exists())
        todolist = userDocSnap.get("todolist") || [];

    let text = "Today I want to complete:<br>";

    for (const item of todolist) 
    {
        if (!item || item.trim() === "") continue;
        text += "- " + item + "<br>";
    }

    postinputElement.value = text;
});

async function renderPosts(posts) 
{
    const output = document.getElementById("output");
    output.innerHTML = "";

    const userinfo = {};

    for (let i = posts.length - 1; i >= 0; i--) 
    {
        const postObj = posts[i];
        const userEmail = postObj.user;

        if (!userinfo[userEmail]) 
        {
            const userDocRef = doc(db, "users", userEmail);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) 
            {
                userinfo[userEmail] = {name: userDocSnap.get("name") || userEmail, username: userDocSnap.get("username") || userEmail.split('@')[0]};
            } 
            else 
            {
                userinfo[userEmail] = { name: userEmail, username: userEmail.split('@')[0] };
            }
        }

        const { name, username } = userinfo[userEmail];

        const showDelete = (userEmail === email);
        console.log("showDelete:", showDelete, "userEmail:", userEmail, "email:", email);

        const postHTML = `
            <div class="tweet" data-index="${i}">
                <div class="tweet-header">
                    <strong class="tweet-name">${name}</strong>
                    <span class="tweet-handle">@${username}</span>
                </div>
                <div class="tweet-body">${postObj.post}</div>
                <div class="tweet-actions">
                    <button class="action-btn like-btn">❤️ <span class="like-count">${postObj.likes || 0}</span></button>
                    ${showDelete ? `<button class="action-btn delete-btn">🗑️ Delete</button>` : ""}
                </div>
            </div>
        `;

        output.innerHTML += postHTML;
    }

    document.querySelectorAll(".delete-btn").forEach(button => 
    {
        button.addEventListener("click", async (e) => 
        {
            const tweetDiv = e.target.closest(".tweet");
            if (!tweetDiv) return;

            const index = parseInt(tweetDiv.getAttribute("data-index"));
            
            if (isNaN(index)) return;

            posts.splice(index, 1);

            const docRef = doc(db, "worlds", worldname);

            try 
            {
                await updateDoc(docRef, {posts: posts});
                await renderPosts(posts);

            } 
            catch (error) 
            {
                console.error("Error deleting post:", error);
            }
        });
    });
}

document.getElementById("addmood").addEventListener("click", async () => 
{
    const postinputElement = document.getElementById("postinput");

    const user = localStorage.getItem("userEmail");
    const userDocRef = doc(db, "users", user);
    const userDocSnap = await getDoc(userDocRef);

    let mood = ""
    if (userDocSnap.exists())
        mood = userDocSnap.get("mood") || "neutral";

    let text = `Today I am feeling ${mood}.`;

    postinputElement.value = text;
});

document.getElementById("addhabits").addEventListener("click", async () => 
{
    const postinputElement = document.getElementById("postinput");

    const user = localStorage.getItem("userEmail");
    const userDocRef = doc(db, "users", user);
    const userDocSnap = await getDoc(userDocRef);

    let habits = [];
    if (userDocSnap.exists())
        habits = userDocSnap.get("habits") || [];

    let text = "My habits are:<br>";

    for (const item of habits) 
    {
        if (!item || item.trim() === "") continue;
        text += "- " + item + "<br>";
    }

    postinputElement.value = text;
});