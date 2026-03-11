require("dotenv").config()

const express = require("express")
const cors = require("cors")
const Groq = require("groq-sdk")
const fs = require("fs")
const natural = require("natural")

const app = express()
app.use(cors())
app.use(express.json())

const tokenizer = new natural.WordTokenizer()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

/* LOAD DOCUMENTS */

const documents = JSON.parse(
  fs.readFileSync("./src/documents.json", "utf8")
)

/* TFIDF MODEL */

const TfIdf = natural.TfIdf
const tfidf = new TfIdf()

documents.forEach(doc => {
  tfidf.addDocument(doc.text)
})

/* FIND RELEVANT CONTEXT */

function retrieveRelevantDocs(query) {

  query = query.toLowerCase()

  let scores = []

  tfidf.tfidfs(query, function(i, measure) {
    scores.push({
      index: i,
      score: measure
    })
  })

  scores.sort((a,b)=> b.score - a.score)

  let selectedDocs = scores.slice(0,3).map(s => documents[s.index].text)

  /* Force include project docs if question about projects */

  if(query.includes("project")){

    const projectDocs = documents
      .filter(doc => doc.text.toLowerCase().includes("project"))
      .map(doc => doc.text)

    selectedDocs = [...new Set([...selectedDocs, ...projectDocs])]
  }

  return selectedDocs.join("\n")
}

/* CHAT ROUTE */

app.post("/chat", async (req,res)=>{

  try{

    const userMessage = req.body.message

    const context = retrieveRelevantDocs(userMessage)

    const completion = await groq.chat.completions.create({

      model:"llama-3.3-70b-versatile",

      messages:[
        {
          role:"system",
          content:`You are an AI assistant answering questions about Abhishek Kalyan.

Use the context below to answer.

${context}

If information is missing, say you don't have that information.`
        },

        {
          role:"user",
          content:userMessage
        }
      ]
    })

    res.json({
      reply: completion.choices[0].message.content
    })

  }

  catch(error){

    console.error(error)

    res.json({
      reply:"Server error occurred."
    })

  }

})

app.get("/", (req,res)=>{
  res.send("AI Twin RAG Backend Running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
  console.log("Server running on port",PORT)
})