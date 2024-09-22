document.getElementById("send-button").addEventListener("click", async () => {
    const userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    addMessage(userInput, "user-message");
    document.getElementById("user-input").value = "";

    // Call the backend API
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
    });

    const data = await response.json();
    addMessage(data.reply, "bot-message");
});

function addMessage(message, className) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${className}`;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
}
