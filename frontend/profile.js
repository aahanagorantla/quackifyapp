import { doc, getDoc, getFirestore, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const email = localStorage.getItem("userEmail");
const docRef = doc(db, "users", email);
const docSnap = await getDoc(docRef);

const necklaces = ["duckfits/IMG_0900.PNG", "duckfits/IMG_0918.PNG", "duckfits/IMG_0919.PNG", "duckfits/IMG_0920.PNG" ];
const hats = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0910.PNG", "duckfits/IMG_0911.PNG", "duckfits/IMG_0912.PNG", "duckfits/IMG_0913.PNG", "duckfits/IMG_0914.PNG", "duckfits/IMG_0915.PNG", "duckfits/IMG_0916.PNG", "duckfits/IMG_0917.PNG" ];
const shirts = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0905.PNG", "duckfits/IMG_0906.PNG", "duckfits/IMG_0907.PNG", "duckfits/IMG_0909.PNG"];
const shoes = [ "duckfits/IMG_0900.PNG", "duckfits/IMG_0902.PNG", "duckfits/IMG_0903.PNG", "duckfits/IMG_0904.PNG" ];


const todoItemInput = document.getElementById("todolistinput");
const moodSlider = document.getElementById("moodSlider");
const moodDuck = document.getElementById("moodDuck");

var name, username, bio, pronouns, avatar, todolist, completedtasks;

if (docSnap.exists()) 
{
    name = docSnap.get("name");
    username = docSnap.get("username");
    bio = docSnap.get("bio");
    pronouns = docSnap.get("pronouns");
    avatar = docSnap.get("avatar");
    todolist = docSnap.get("todolist");
    completedtasks = docSnap.get("completedtasks");

    console.log(avatar.shoesIndex, avatar.shirtIndex, avatar.hatIndex, avatar.necklaceIndex);

    if (avatar) 
    {
        document.getElementById("necklace").src = necklaces[avatar.necklaceIndex];
        document.getElementById("hat").src = hats[avatar.hatIndex];
        document.getElementById("shirt").src = shirts[avatar.shirtIndex];
        document.getElementById("shoes").src = shoes[avatar.shoesIndex];   
    }

} 
else console.log("No such document!");


await loadHabits();

document.getElementById("bioText").textContent = bio;

document.getElementById("name").textContent = name;
document.getElementById("username").textContent = "@" + username;
document.getElementById("pronouns").textContent = pronouns;

if (!Array.isArray(todolist)) todolist = [];
if (!Array.isArray(completedtasks)) completedtasks = [];


function updateToDoList() 
{
    const list = document.getElementById("todolistitems");
    list.innerHTML = "";

    for (const item of todolist) 
    {
        if (item.trim() !== "") 
        {
            const li = document.createElement("li");
            li.classList.add("todoitem");

            const itemline = document.createElement("span");
            itemline.textContent = item;
            if (completedtasks.includes(item)) {
                itemline.classList.add("completedtask");
            }

            itemline.onclick = function () {
                completetask(itemline);
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️";
            deleteBtn.classList.add("deletebtn");
            deleteBtn.onclick = function () {
                deletetask(item);
            };

            li.appendChild(itemline);
            li.appendChild(deleteBtn);
            list.appendChild(li);
        }
    }
}

async function addtask() 
{
    const input = todoItemInput.value.trim();
    if (input !== "") 
    {
        todolist.push(input);

        await updateDoc(docRef, {
            todolist: todolist
        });

        updateToDoList();
        todoItemInput.value = "";
    }
}

async function completetask(li) 
{
    const task = li.textContent;

    if (li.classList.contains("completedtask")) 
    {
        li.classList.remove("completedtask");
        const index = completedtasks.indexOf(task);
        if (index !== -1) 
        {
            completedtasks.splice(index, 1);
        }    
    } 
    else 
    {
        li.classList.add("completedtask");
        completedtasks.push(task);
    }

    await updateDoc(docRef, {
        completedtasks: completedtasks
    });
}

async function deletetask(task) {
    const index = todolist.indexOf(task);
    if (index !== -1) {
        todolist.splice(index, 1);
    }

    const completedIndex = completedtasks.indexOf(task);
    if (completedIndex !== -1) {
        completedtasks.splice(completedIndex, 1);
    }

    await updateDoc(docRef, {
        todolist: todolist,
        completedtasks: completedtasks
    });

    updateToDoList();
}


todoItemInput.addEventListener('keydown', function (event) 
{
    if (event.key === 'Enter')
        addtask();
});

function gotoponds(){
    window.location.href = "choosepond.html"
}

function gotochat(){
    window.location.href = "aichat.html "
}

document.getElementById("additembtn").addEventListener("click", addtask);
document.getElementById("ponds").addEventListener("click", gotoponds);
document.getElementById("chat").addEventListener("click", gotochat);

const date = new Date();
const formatted = date.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric"
});

document.getElementById("datetext").textContent += formatted;

updateToDoList();

moodSlider.addEventListener('input', async () => 
{
    const moodVal = moodSlider.value;

    if (moodVal == 1)
    {
        moodDuck.src = "duckmoods/supersad.png";
        await updateDoc(docRef, { mood: "super sad"});
    }

    if (moodVal == 2)
    {
        moodDuck.src = "duckmoods/sad.png";
        await updateDoc(docRef, { mood: "sad"});
    }
    
    if (moodVal == 3)
    {
        moodDuck.src = "duckmoods/neutral.png";
        await updateDoc(docRef, { mood: "neutral"});
    }

    if (moodVal == 4)
    {
        moodDuck.src = "duckmoods/happy.png";
        await updateDoc(docRef, { mood: "happy"});
    }

    if (moodVal == 5)
    {
        moodDuck.src = "duckmoods/superhappy.png";
        await updateDoc(docRef, { mood: "super happy"});
    }
});

window.addNewHabit = addNewHabit;
async function addNewHabit() 
{
    const habitList = document.getElementById("habitList");
    //const addHabit = document.getElementById("addHabit");
    const newHabit = document.getElementById("newHabitInput");
    const newHabitText = newHabit.value.trim();

    if (newHabitText != "") 
    {
        const label = document.createElement('label')
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "habit";
        checkbox.value = newHabitText;
        //checkbox.id = "id";

        //label.htmlFor = "id";
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + newHabitText));

        habitList.appendChild(label);  
        habitList.appendChild(document.createElement('br'));
        newHabit.value = "";

        try
        {
            const userRef = doc(db, "users", email);
            await updateDoc(userRef, { habits: arrayUnion(newHabitText) });
        } 
        catch (e) 
        {
            console.error("Error saving habit:", e);
        }
    }
}

async function loadHabits()
{
    const habitList = document.getElementById("habitList");
    habitList.innerHTML = "";

    try 
    {
        const userRef = doc(db, "users", email);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) 
        {
            const data = docSnap.data();
            const habits = data.habits || [];

            habits.forEach(habitText => 
            {
                const label = document.createElement('label')
                const checkbox = document.createElement('input');
                checkbox.type = "checkbox";
                checkbox.name = "habit";
                checkbox.value = habitText;
                //checkbox.id = "id";

                //label.htmlFor = "id";
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(" " + habitText));

                habitList.appendChild(label);  
                habitList.appendChild(document.createElement('br'));
            });
        }
    } 
    catch (e)
    {
        console.error("Error loading habits:", e);
    }  
}