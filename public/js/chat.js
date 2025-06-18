const socket = io();

const senderId = document.getElementById("senderId").value;
const receiverId = document.getElementById("receiverId").value;
const room = [senderId, receiverId].sort().join("_");

socket.emit("joinRoom", { room });

socket.on("newMessage", ({ message, sender }) => {
  const chatBox = document.querySelector(".chat-box");
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === senderId ? "my-msg" : "their-msg";
  msgDiv.innerHTML = `<p>${message}</p>`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

document.querySelector("#chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.message.value;
  socket.emit("chatMessage", {
    room,
    message,
    sender: senderId,
    receiver: receiverId
  });
  e.target.message.value = "";
});
