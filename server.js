require("dotenv").config()

const express = require("express")
const cors = require("cors")
const Groq = require("groq-sdk")
const fs = require("fs")

const use = require("@tensorflow-models/universal-sentence-encoder")
require("@tensorflow/tfjs-node")

const cosine = require("cosine-similarity")

const app = express()
app.use(cors())
app.use(express.json())

const groq = new Groq({
 apiKey: process.env.GROQ_API_KEY
})

/* LOAD DOCUMENTS */

const documents = JSON.parse(
 fs.readFileSync("./src/documents.json","utf8")
)

let embeddings = []
let model

/* LOAD EMBEDDING MODEL */

async function loadModel(){

 model = await use.load()

 const texts = documents.map(d => d.text)

 const vectors = await model.embed(texts)

 embeddings = vectors.arraySync()

 console.log("Embeddings loaded")

}

loadModel()

/* SEMANTIC SEARCH */

async function retrieveDocs(query){

 const queryEmbedding = await model.embed([query])
 const queryVector = queryEmbedding.arraySync()[0]

 let scores = embeddings.map((vector,i)=>{

  return {
   index:i,
   score: cosine(queryVector,vector)
  }

 })

 scores.sort((a,b)=>b.score-a.score)

 const topDocs = scores.slice(0,4)
 .map(s=>documents[s.index].text)

 return topDocs.join("\n")

}

/* MEMORY */

let conversationHistory = []

/* CHAT ROUTE */

app.post("/chat", async (req,res)=>{

 try{

  const userMessage = req.body.message

  const context = await retrieveDocs(userMessage)

  conversationHistory.push({
   role:"user",
   content:userMessage
  })

  const completion = await groq.chat.completions.create({

   model:"llama-3.3-70b-versatile",

   messages:[

    {
     role:"system",
     content:`You are an AI twin of Abhishek Kalyan.

Use the knowledge context below.

${context}

If the user is a recruiter asking for summary or hiring evaluation, provide a concise professional response.

Do not invent information.`
    },

    ...conversationHistory

   ]

  })

  const reply = completion.choices[0].message.content

  conversationHistory.push({
   role:"assistant",
   content:reply
  })

  if(conversationHistory.length > 10){
   conversationHistory.shift()
  }

  res.json({reply})

 }

 catch(err){

  console.error(err)

  res.json({reply:"Server error occurred."})

 }

})

app.get("/",(req,res)=>{

 res.send("AI Twin Phase 3 Running")

})

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{

 console.log("Server running on",PORT)

})