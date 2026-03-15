import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_URL = "https://ai-twin-htep.onrender.com";

export default function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [stats, setStats] = useState({
    questions: 0,
    interviewMode: false
  });

  const recognitionRef = useRef(null);

  useEffect(() => {

    if ("webkitSpeechRecognition" in window) {

      const recognition = new window.webkitSpeechRecognition();

      recognition.continuous = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {

        const transcript = event.results[0][0].transcript;

        setInput(transcript);

      };

      recognitionRef.current = recognition;

    }

  }, []);

  function speak(text) {

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

  }

  async function sendMessage(messageText = input) {

    if (!messageText) return;

    const newMessages = [
      ...messages,
      { role: "user", content: messageText }
    ];

    setMessages(newMessages);

    setInput("");

    setStats({
      ...stats,
      questions: stats.questions + 1
    });

    const response = await fetch(API_URL + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: messageText })
    });

    const data = await response.json();

    const reply = data.reply;

    const updated = [
      ...newMessages,
      { role: "assistant", content: reply }
    ];

    setMessages(updated);

    speak(reply);

  }

  async function startInterview() {

    const res = await fetch(API_URL + "/interview", {
      method: "POST"
    });

    const data = await res.json();

    const question = data.question;

    setMessages([
      ...messages,
      { role: "assistant", content: question }
    ]);

    speak(question);

    setStats({
      ...stats,
      interviewMode: true
    });

  }

  function startVoiceInput() {

    if (!recognitionRef.current) return;

    setListening(true);

    recognitionRef.current.start();

    recognitionRef.current.onend = () => {
      setListening(false);
    };

  }

  return (

    <div className="app">

      <div className="profileCard">

        <img src="/abhishek.jpg" alt="profile" />

        <div>

          <h2>Abhishek Kalyan</h2>

          <p>SPS Associate Advisor</p>

          <p>Amazon Development Center Pvt Ltd</p>

          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>

        </div>

      </div>

      <div className="avatar">

        <div className="pulse"></div>

      </div>

      <div className="buttons">

        <button onClick={() => sendMessage("Who is Abhishek Kalyan?")}>
          Who is Abhishek
        </button>

        <button onClick={() => sendMessage("Tell me about his projects")}>
          Projects
        </button>

        <button onClick={() => sendMessage("What leadership experience does he have?")}>
          Leadership
        </button>

        <button onClick={() => sendMessage("What are his achievements?")}>
          Achievements
        </button>

        <button onClick={startInterview}>
          Start AI Interview
        </button>

      </div>

      <div className="chat">

        {messages.map((m, i) => (

          <div
            key={i}
            className={
              m.role === "user"
                ? "message user"
                : "message ai"
            }
          >
            {m.content}
          </div>

        ))}

      </div>

      <div className="inputArea">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Abhishek..."
        />

        <button onClick={() => sendMessage()}>
          Send
        </button>

        <button onClick={startVoiceInput}>
          {listening ? "Listening..." : "🎤"}
        </button>

      </div>

      <div className="analytics">

        <h3>Recruiter Interaction Stats</h3>

        <p>Questions asked: {stats.questions}</p>

        <p>
          Interview Mode:
          {stats.interviewMode ? " Active" : " Off"}
        </p>

      </div>

    </div>

  );

}