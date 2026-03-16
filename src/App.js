import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_URL = "https://ai-twin-htep.onrender.com";

export default function App() {

const [messages,setMessages] = useState(
  JSON.parse(localStorage.getItem("chatHistory")) || []
);

const [input,setInput] = useState("");
const [voiceEnabled,setVoiceEnabled] = useState(false);
const [loading,setLoading] = useState(false);

const chatEndRef = useRef(null);

useEffect(()=>{
  localStorage.setItem("chatHistory",JSON.stringify(messages));
  chatEndRef.current?.scrollIntoView({behavior:"smooth"});
},[messages]);

function speak(text){

if(!voiceEnabled) return;

const speech = new SpeechSynthesisUtterance(text);
speech.rate = 1;
speech.pitch = 1;

window.speechSynthesis.speak(speech);

}

async function sendMessage(messageText=input){

if(!messageText) return;

const timestamp = new Date().toLocaleTimeString();

const newMessages=[
...messages,
{role:"user",content:messageText,time:timestamp}
];

setMessages(newMessages);
setInput("");
setLoading(true);

const res = await fetch(API_URL+"/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:messageText})
});

const data = await res.json();

const replyTime = new Date().toLocaleTimeString();

const updated=[
...newMessages,
{role:"assistant",content:data.reply,time:replyTime}
];

setMessages(updated);
setLoading(false);

speak(data.reply);

}

function startVoiceInput(){

const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;

if(!SpeechRecognition){
alert("Voice input not supported");
return;
}

const recognition = new SpeechRecognition();

recognition.lang="en-US";

recognition.onresult=(event)=>{
const transcript = event.results[0][0].transcript;
sendMessage(transcript);
};

recognition.start();

}

return(

<div className="app">

<div className="hero">

<div className="heroOverlay">

<h1>Meet My AI Twin</h1>

<p>
Recruiters can interact with an AI version of my resume,
projects and leadership experience.
</p>

</div>

</div>

<div className="chatContainer">

<div className="quickButtons">

<button onClick={()=>sendMessage("Who is Abhishek Kalyan")}>
Who is Abhishek
</button>

<button onClick={()=>sendMessage("Tell me about his projects")}>
Projects
</button>

<button onClick={()=>sendMessage("Leadership experience")}>
Leadership
</button>

<button onClick={()=>sendMessage("Achievements")}>
Achievements
</button>

<button onClick={()=>sendMessage("Start interview")}>
AI Interview
</button>

</div>

<div className="chatBox">

{messages.map((m,i)=>(

<div key={i}
className={m.role==="user" ? "bubble user":"bubble ai"}>

<div>{m.content}</div>

<span className="time">{m.time}</span>

</div>

))}

{loading && (
<div className="typing">
AI is thinking...
</div>
)}

<div ref={chatEndRef}></div>

</div>

<div className="inputBar">

<input
value={input}
onChange={(e)=>setInput(e.target.value)}
placeholder="Ask the AI about Abhishek..."
/>

<button onClick={()=>sendMessage()}>
Send
</button>

<button
className="micButton"
onClick={startVoiceInput}
>
🎤
</button>

<button
className={voiceEnabled?"voiceOn":"voiceOff"}
onClick={()=>setVoiceEnabled(!voiceEnabled)}
>
🔊
</button>

</div>

</div>

</div>

);

}
