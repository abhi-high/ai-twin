import React, { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [listening, setListening] = useState(false);

  async function sendMessage() {
    if (!message) return;

    const userMessage = message;

    setChat(prev => [...prev, { role: "user", content: userMessage }]);
    setMessage("");

    try {
    const res = await fetch("https://ai-twin.onrender.com/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: userMessage })
});

      const data = await res.json();
      setChat(prev => [...prev, { role: "ai", content: data.reply }]);

    } catch {
      setChat(prev => [...prev, { role: "ai", content: "Server connection error." }]);
    }
  }

  function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.95;
    speech.pitch = 0.9;
    window.speechSynthesis.speak(speech);
  }

  function startListening() {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      setMessage(event.results[0][0].transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
  }

  return (
    <div style={styles.page}>
      
      {/* Glass Header */}
      <div style={styles.header}>
        <img src="/abhishek.jpg" alt="Abhishek" style={styles.avatar} />
        <div>
          <h2 style={{ margin: 0 }}>Abhishek Kalyan</h2>
          <p style={{ margin: 0 }}>SPS Associate Advisor</p>
          <a
            href="https://www.linkedin.com/in/abhishek-kalyan-882bb498/"
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            View LinkedIn
          </a>
        </div>
      </div>

      {/* Chat Section */}
      <div style={styles.chatBox}>
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background:
                msg.role === "user"
                  ? "rgba(56, 189, 248, 0.3)"
                  : "rgba(255,255,255,0.15)"
            }}
          >
            {msg.content}
            {msg.role === "ai" && (
              <button style={styles.audioBtn} onClick={() => speak(msg.content)}>
                🔊
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={styles.inputBox}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something about Abhishek..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          Send
        </button>
        <button onClick={startListening} style={styles.micBtn}>
          {listening ? "🎙️..." : "🎤"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    color: "white",
    fontFamily: "Segoe UI"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    borderRadius: "20px",
    backdropFilter: "blur(15px)",
    background: "rgba(255,255,255,0.1)",
    marginBottom: "20px"
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%"
  },
  link: {
    color: "#38bdf8",
    textDecoration: "none"
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px"
  },
  message: {
    padding: "15px",
    borderRadius: "15px",
    maxWidth: "70%",
    backdropFilter: "blur(10px)",
    position: "relative"
  },
  audioBtn: {
    marginTop: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "white"
  },
  inputBox: {
    display: "flex",
    gap: "10px"
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none"
  },
  sendBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer"
  },
  micBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer"
  }
};

export default App;