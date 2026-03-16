import React, { useState, useRef } from "react";
import "./App.css";

const API_URL = "https://ai-twin-htep.onrender.com";

export default function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [stats, setStats] = useState({ questions: 0, interviewMode:false });

  const recognitionRef = useRef(null);

  function speak(text){

    if(!voiceEnabled) return;

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

  }

  async function sendMessage(messageText = input){

    if(!messageText) return;

    const newMessages = [
      ...messages,
      {role:"user", content:messageText}
    ];

    setMessages(newMessages);
    setInput("");

    const res = await fetch(API_URL + "/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:messageText})
    });

    const data = await res.json();

    const reply = data.reply;

    const updated = [
      ...newMessages,
      {role:"assistant", content:reply}
    ];

    setMessages(updated);

    speak(reply);

    setStats({
      ...stats,
      questions:stats.questions + 1
    });

  }

  async function startInterview(){

    const res = await fetch(API_URL + "/interview",{method:"POST"});
    const data = await res.json();

    const question = data.question;

    const updated = [
      ...messages,
      {role:"assistant", content:question}
    ];

    setMessages(updated);

    speak(question);

    setStats({
      ...stats,
      interviewMode:true
    });

  }

  function startVoiceInput(){

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if(!SpeechRecognition){
      alert("Voice input not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.onresult = (event)=>{

      const transcript = event.results[0][0].transcript;

      sendMessage(transcript);

    };

    recognition.start();

  }

  return(

  <div className="app">

    <header className="header">

      <img src="/abhishek.jpg" alt="profile"/>

      <div>
        <h1>Abhishek Kalyan</h1>
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

    </header>

    <div className="quickButtons">

      <button onClick={()=>sendMessage("Who is Abhishek Kalyan?")}>
        Who is Abhishek
      </button>

      <button onClick={()=>sendMessage("Tell me about his projects")}>
        Projects
      </button>

      <button onClick={()=>sendMessage("What leadership experience does he have?")}>
        Leadership
      </button>

      <button onClick={()=>sendMessage("What are his achievements?")}>
        Achievements
      </button>

      <button onClick={startInterview}>
        Start AI Interview
      </button>

    </div>

    <div className="chat">

      {messages.map((m,i)=>(
        <div
          key={i}
          className={m.role === "user" ? "bubble user":"bubble ai"}
        >
          {m.content}
        </div>
      ))}

    </div>

    <div className="inputBar">

      <input
        value={input}
        onChange={(e)=>setInput(e.target.value)}
        placeholder="Ask about Abhishek..."
      />

      <button onClick={()=>sendMessage()}>
        Send
      </button>

      <button onClick={startVoiceInput}>
        🎤
      </button>

      <button
        className={voiceEnabled ? "voiceOn":"voiceOff"}
        onClick={()=>setVoiceEnabled(!voiceEnabled)}
      >
        🔊
      </button>

    </div>

    <div className="stats">

      <h3>Recruiter Interaction Stats</h3>

      <p>Questions asked: {stats.questions}</p>

      <p>Interview Mode: {stats.interviewMode ? "Active":"Off"}</p>

    </div>

  </div>

  );

}