import React, { useState } from "react";
import "./App.css";

function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Backend API
  const API_URL = "https://ai-twin-htep.onrender.com/chat";

  const sendMessage = async (text) => {

    const message = text || input;

    if (!message) return;

    const userMsg = { role: "user", content: message };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {

    const res = await fetch(`${API_URL}/chat`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message })
});

      const data = await res.json();

      const aiMsg = {
        role: "ai",
        content: data.reply
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {

      setMessages(prev => [
        ...prev,
        { role: "ai", content: "Error contacting AI server." }
      ]);

    }

  };


  const startInterview = async () => {

    try {

      const res = await fetch(`${API_URL}/interview`, {
        method: "POST"
      });

      const data = await res.json();

      setMessages([
        { role: "ai", content: "AI Interview Mode Started." },
        { role: "ai", content: data.question }
      ]);

    } catch {

      setMessages([
        { role: "ai", content: "Unable to start interview." }
      ]);

    }

  };


  return (

    <div className="container">

      <header>
<img
  src="/abhishek.jpg"
  alt="Abhishek Kalyan"
  className="profile"
/>

        <h1>AI Twin — Abhishek Kalyan</h1>
        <p>Interactive AI Resume Assistant</p>

      </header>


      <div className="chat">

        {messages.map((m, i) => (

          <div
            key={i}
            className={m.role === "user" ? "user" : "ai"}
          >
            {m.content}
          </div>

        ))}

      </div>


      <div className="buttons">

        <button onClick={() => sendMessage("who is abhishek")}>
          Who is Abhishek
        </button>

        <button onClick={() => sendMessage("projects")}>
          Projects
        </button>

        <button onClick={() => sendMessage("leadership")}>
          Leadership
        </button>

        <button onClick={() => sendMessage("achievements")}>
          Achievements
        </button>

        <button onClick={startInterview}>
          Start AI Interview
        </button>

      </div>


      <div className="input">

        <input
          value={input}
          placeholder="Ask about Abhishek..."
          onChange={(e) => setInput(e.target.value)}
        />

        <button onClick={() => sendMessage()}>
          Send
        </button>

      </div>

    </div>

  );
}

export default App;