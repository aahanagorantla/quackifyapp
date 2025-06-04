const chatWindow = document.getElementById("chatwindow");
const chatForm = document.getElementById("form");
const userInput = document.getElementById("userinput");

function appendMessage(text, sender, id = null)
{
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = text;

    if (id)
        msgDiv.id = id;

    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage(message)
{
    appendMessage(message, "user");

    const loadingId = "loading-indicator";
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("message", "bot");
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = `
        <div class="thinking">
            <span></span><span></span><span></span>
        </div>
    `;

    chatWindow.appendChild(loadingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try
    {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });

        if (!res.ok)
            throw new Error("Network error");

        const data = await res.json();

        const oldLoading = document.getElementById(loadingId);
        if (oldLoading)
            oldLoading.remove();

        appendMessage(data.reply, "bot");
    }
    catch (err)
    {
        const oldLoading = document.getElementById(loadingId);
        if (oldLoading)
            oldLoading.remove();

        appendMessage("Error: Could not get response from chatbot.", "bot");
    }
}

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;
    sendMessage(message);
    userInput.value = "";
});

window.addEventListener("DOMContentLoaded", () => {
    const introMessage = `Hi! I'm Quacksy, your friendly AI duck 🦆 here to help you stay focused, reduce stress, and keep things balanced — all with a little quack of wisdom along the way! Let's paddle through your goals together! What can I help you with right now?`;
    appendMessage(introMessage, "bot");
});