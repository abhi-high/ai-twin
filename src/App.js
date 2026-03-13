import React, { useState } from "react";
import "./App.css";

function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {

    const userText = text || input;

    if (!userText.trim()) return;

    const userMessage = { role: "user", content: userText };

    setMessages(prev => [...prev, userMessage]);

    setInput("");
    setLoading(true);

    const response = await fetch("https://ai-twin-htep.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userText })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let aiText = "";

    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    while (true) {

      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      aiText += chunk;

      setMessages(prev => {

        const newMessages = [...prev];

        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: aiText
        };

        return newMessages;
      });

    }

    setLoading(false);
  };

  return (

    <div className="app">

      <h1>AI Twin – Abhishek Kalyan</h1>

      <div className="chat-box">

        {messages.map((msg, i) => (

          <div key={i} className={msg.role === "user" ? "user" : "ai"}>

            {msg.content}

          </div>

        ))}

        {loading && <div className="thinking">AI thinking...</div>}

      </div>

      <div className="quick-buttons">

        <button onClick={() => sendMessage("Who is Abhishek Kalyan?")}>
          Who is Abhishek
        </button>

        <button onClick={() => sendMessage("What projects has Abhishek worked on?")}>
          Projects
        </button>

        <button onClick={() => sendMessage("Tell me about Abhishek leadership experience")}>
          Leadership
        </button>

        <button onClick={() => sendMessage("What are Abhishek achievements?")}>
          Achievements
        </button>

      </div>

      <div className="input-area">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Abhishek's experience..."
        />

        <button onClick={() => sendMessage()}>
          Send
        </button>

      </div>

    </div>

  );
}

export default App; 