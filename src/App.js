import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import heroImage from "./abhishek.jpg";


const API_URL = "https://ai-twin-htep.onrender.com";

export default function App() {

const [messages,setMessages] = useState([]);
const [input,setInput] = useState("");
const [typing,setTyping] = useState(false);
const [voiceEnabled,setVoiceEnabled] = useState(false);

const [stats,setStats] = useState({
questions:0,
interview:false
});

const chatEndRef = useRef(null);

useEffect(()=>{
chatEndRef.current?.scrollIntoView({behavior:"smooth"});
},[messages]);

  useEffect(()=>{

const saved=localStorage.getItem("ai_twin_chat");

if(saved){
setMessages(JSON.parse(saved));
}

},[]);

  useEffect(()=>{

localStorage.setItem(
"ai_twin_chat",
JSON.stringify(messages)
);

},[messages]);

function timestamp(){
return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

function speak(text){

if(!voiceEnabled) return;

const speech = new SpeechSynthesisUtterance(text);

speech.rate=1;
speech.pitch=1;

window.speechSynthesis.speak(speech);

}

async function sendMessage(text=input){

if(!text) return;

const userMsg={
role:"user",
content:text,
time:timestamp()
};

setMessages(prev=>[...prev,userMsg]);
setInput("");

setTyping(true);

const res = await fetch(API_URL+"/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:text})
});

const data = await res.json();

setTyping(false);

const reply=data.reply;

const aiMsg={
role:"ai",
content:reply,
time:timestamp()
};

setMessages(prev=>[...prev,aiMsg]);

speak(reply);

setStats({
...stats,
questions:stats.questions+1
});

}

async function startInterview(){

const res=await fetch(API_URL+"/interview",{method:"POST"});
const data=await res.json();

const aiMsg={
role:"ai",
content:data.question,
time:timestamp()
};

setMessages(prev=>[...prev,aiMsg]);

speak(data.question);

setStats({
...stats,
interview:true
});

}

function startVoice(){

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if(!SpeechRecognition){
alert("Voice input not supported");
return;
}

const recognition=new SpeechRecognition();

recognition.lang="en-US";

recognition.onresult=(e)=>{
const transcript=e.results[0][0].transcript;
sendMessage(transcript);
};

recognition.start();

}

return(

<div className="app">

<div
className="hero"
style={{backgroundImage:`url(${heroImage})`}}
>

<div className="heroOverlay">

<h1>Meet My AI Twin</h1>

<p>
Recruiters can interact with an AI version of my experience,
projects and leadership journey.
</p>

</div>

</div>

  <div className="profileCard">

<h2>Abhishek Kalyan</h2>

<p>SPS Associate Advisor – Amazon</p>

<p>
Operations leader with 9+ years of experience improving
customer support performance, scaling global teams and
optimizing operational systems.
</p>

</div>

<div className="chatContainer">

<div className="quickButtons">

<button onClick={()=>sendMessage("Who is Abhishek Kalyan")}>Who is Abhishek</button>

<button onClick={()=>sendMessage("Tell me about his projects")}>Projects</button>

<button onClick={()=>sendMessage("What leadership experience does he have")}>Leadership</button>

<button onClick={()=>sendMessage("What are his achievements")}>Achievements</button>

<button onClick={startInterview}>Start AI Interview</button>

</div>

<div className="chatBox">

{messages.map((m,i)=>(

<div key={i} className={`bubble ${m.role}`}>

{m.content}

<span className="time">{m.time}</span>

</div>

))}

{typing && (

<div className="bubble ai typing">

AI is typing...

</div>

)}

<div ref={chatEndRef}/>

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

<button onClick={startVoice} className="micButton">
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

<div className="stats">

<h3>Recruiter Interaction Stats</h3>

<p>Questions asked: {stats.questions}</p>

<p>Interview Mode: {stats.interview ? "Active":"Off"}</p>

</div>

</div>

);

}
