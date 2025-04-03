const socket = io();

const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const messagesContainer = document.getElementById("messages");

const userId = Math.random().toString(36).substring(2, 10); // Generate unique user ID

// Convert emoji characters to actual emojis
function convertEmojis(text) {
    return text
        .replace(/:\)/g, "😊")
        .replace(/:\(/g, "☹️")
        .replace(/:D/g, "😃")
        .replace(/:P/g, "😛");
}

// Send message
sendBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("message", { userId, message: convertEmojis(message) });
        messageInput.value = "";
    }
});

// Receive messages
socket.on("message", ({ userId: senderId, message }) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    // Align message based on sender
    if (senderId === userId) {
        messageElement.classList.add("right");
    } else {
        messageElement.classList.add("left");
    }

    messageElement.innerText = message;
    messagesContainer.appendChild(messageElement);
});

// Voice input
voiceBtn.addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
        const voiceText = event.results[0][0].transcript;
        messageInput.value = convertEmojis(voiceText); // Convert emojis in speech
    };

    recognition.start();
});
