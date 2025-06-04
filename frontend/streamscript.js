function geturl() //so it works in production
{     
    if ( window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
        return 'ws://127.0.0.1:5000'; 
    else return `wss://${window.location.hostname}:5000`;
}

const socket = new WebSocket(geturl());

socket.addEventListener('message', function (event) {
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

function post()     //display posts for everyone
{   
    var user1 = document.getElementById("u1");
    var user2 = document.getElementById("u2");
    var postContent = document.getElementById("input").value;

    if (postContent.trim() === "") 
    {
        alert("Post content cannot be empty.");
        return;
    }

    var newPost = "";

    if(user1.checked) 
        newPost = "<div><strong>User 1:</strong> " + postContent + "</div>";
    else if(user2.checked) 
        newPost = "<div><strong>User 2:</strong> " + postContent + "</div>";
    else 
    {           
        alert("Please select a user.");
        return;
    }

    document.getElementById("input").value = "";

    socket.send(newPost);           //socket.on(message) is triggered here
}

var inputField = document.getElementById("input");

inputField.addEventListener('keydown', function(event) 
{
    if (event.key === 'Enter'  ) 
        document.getElementById("submit").click();
});