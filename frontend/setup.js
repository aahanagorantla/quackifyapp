const res = await fetch('/firebase-config');
const firebaseConfig = await res.json();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const duckChat = document.getElementById("duckchat");
const userchat = document.getElementById("userchat");

const email = localStorage.getItem("userEmail");

const ud = doc(db, "users", email);

var users = []

try 
{
    await updateDoc(ud, { email: email });
    await updateDoc(ud, { todolist: [" "] });
    await updateDoc(ud, { completedtasks: [" "] });
    await updateDoc(ud, { worlds: ["global"]})
    const docRef = doc(db, "worlds", "global");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) 
    {
        users = docSnap.get("users");
    } 
    else 
    {
        console.log("No such document!");
    }
    if (!Array.isArray(users)) users = [];
    users.push(email)
    console.log(users)
    try 
    {
        await updateDoc(docRef, { users: users });
    } catch (e) {
        console.error("Error updating document: ", e);
    }
} catch (e) {
    console.error("Error updating document: ", e);
}

var stepnumber = 0;
var answers = [];
var isAnimating = false;
function getPrompt(stepnumber, answers) 
{
    switch (stepnumber) 
    {
        case 0:
            userchat.disabled = true;
            return "Hiya, new friend! I’m Quacksy, your go-to duck for all things here at Quackify! 🦆\n\nI’m so happy you're here. I do a little bit of everything around here: helping new friends get settled, answering questions about the app, and being your cheerful, chirpy companion anytime you need a buddy!\n\nReady to waddle into a world of productivity, positivity, and adorable ducks? Click on the button to get started!";
        case 1:
            userchat.disabled = false;
            return "First things first: what’s your name?\n\n(And hey, if you'd rather not share, that’s totally okay. Just press the button or hit enter in the textbox and we’ll keep it mysterious and cool!)";
        case 2:
            if (!answers[0]) 
                return "🎭 Mysterious, I like it! Let’s give you a fun username to show off your vibe. 🧑‍💻\n\nWhat’s your snazzy handle going to be? Do NOT include the @ symbol.";
            else return `💛 So nice to meet you, ${answers[0]}! I’ve got a good feeling about us. 🧑‍💻\n\nNow let’s pick a snazzy handle! What’s your one-of-a-kind username? Do NOT include the @ symbol.`;
        case 3:
            return `So cool, @${answers[1]}. You’re totally nailing this. Next up: How would you like others to refer to you?\n\n(You can say things like she/her, he/him, they/them, or whatever feels right for you — we’re all about being you here!)`;
        case 4:
            return "Moving right along, how old are you? This is just for safety purposes - we PRIORITIZE safety here at Quackify.";
        case 5:
            return "We’re almost there! I'm curious: 📣 Tell me about you!\n\nWrite a short lil’ bio for your profile — it could be your hobbies, favorite food, mood of the day, or even a quacky joke. Whatever you want to share with the flock!";
        case 6:
            userchat.disabled = true;
            return "You are doing great! One last thing: Now it’s time for the fun stuff - customize your own duck to be your avatar! Click on the button to get started!";
        case 7: 
            userchat.disabled = true;
            return "😍 IT'S SO CUTE!. I’m obsessed. And now, you’re officially part of the Quackify crew now!🎊\n\nClick on the button to check out your profile and start quacking our way to greatness!\n\nAnd remember: Stay on track, and keep quacking! ✔️🦆";
        default:
            return "";
    }
}

let animationTimeout = null; 
let currentPrompt = "";
function animate(text) 
{
    duckChat.textContent = '';
    currentPrompt = text;
    let i = 0;
    isAnimating = true;

    function typeChar() 
    {
        if (i < text.length) 
        {
            duckChat.textContent += text.charAt(i);
            i++;
            animationTimeout = setTimeout(typeChar, 10);
        } 
        else 
        {
            isAnimating = false;
            animationTimeout = null;
        }
    }

    typeChar();
}

async function processInput(input) 
{
    answers.push(input);
    const userDoc = doc(db, "users", email);
    if (stepnumber == 1) 
    {
        try 
        {
            await updateDoc(userDoc, { name: input });
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    }
    if(stepnumber == 2)
    {
        try 
        {
            await updateDoc(userDoc, { username: input });
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    }
    if(stepnumber == 3)
    {
        try 
        {
            await updateDoc(userDoc, { pronouns: input });
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    }
    if(stepnumber == 5)
    {
        try 
        {
            await updateDoc(userDoc, { bio: input });
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    }

    var worlds = []

    if(stepnumber == 4)
    {
        if(!isNaN(input))
        {
            const worldRef = doc(db, "worlds", input);
            const worldsnap = await getDoc(worldRef)

            if(worldsnap.exists())
            {
                const data = worldsnap.data();
                let users = data.users || [];
                if (!users.includes(email)) 
                {
                    users.push(email);
                    await updateDoc(worldRef, { users });
                }
            }
            else
            {
                await setDoc(worldRef, {users: [email]});
            }
            const docRef = doc(db, "users", email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) 
            {
                worlds = docSnap.get("worlds");
            } 
            else 
            {
                console.log("No such document!");
            }
            if (!Array.isArray(worlds)) worlds = [];
            worlds.push(input)
            try 
            {
                await updateDoc(userDoc, { age: input });
                await updateDoc(docRef, { worlds: worlds });
                //await updateDoc(worlds, {users: //})
            } catch (e) {
                console.error("Error updating document: ", e);
            }
        }
    }
}

function onboard(user = "")
{
    const prompt = getPrompt(stepnumber, answers);
    animate(prompt);
    console.log(user);
    //db.collection("users").doc("user123").update({ name: "Alice" }); 
}

onboard();

async function enter() 
{
    if (isAnimating) 
    {
        if (animationTimeout) 
            clearTimeout(animationTimeout);
        duckChat.textContent = currentPrompt;
        isAnimating = false;
        return;
    }

    const input = userchat.value.trim();

    if (stepnumber === 1 ) 
        await processInput(input);

    if(stepnumber === 3 || stepnumber === 4 || stepnumber === 5)
        if(input == "")
        {
            alert("please give an answer.")
            return;
        }
        else processInput(input)

    if(stepnumber === 2 )
    {
        if(input == "")
        {
            alert("please enter a username.")
            return;
        }
        else
        {
            const q = query(
                collection(db, 'users'),
                where('username', '==', input),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) 
            {
                alert("This username is taken. Choose a different one!");
                userchat.value = "";
                return;
            } 
            else await processInput(input);
        }
    }
    if (stepnumber === 7)
    {
        window.location.href = "profile.html";
        return;
    }

    if(stepnumber === 6)
    {
        window.location.href = "dressup.html";
        return;
    }

    userchat.value = "";
    stepnumber++;
    onboard();
}


userchat.addEventListener('keydown', function(event) 
{
    if (event.key === 'Enter') 
        enter();
});

document.getElementById("btn").addEventListener("click", enter);