import express from "express";
import cors from "cors";
import fs from "fs";
import Groq from "groq-sdk";

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const documents = JSON.parse(
  fs.readFileSync("./backend/documents.json", "utf8")
);

function retrieveDocs(question) {

  const q = question.toLowerCase();

  const results = documents.filter(doc =>
    doc.text.toLowerCase().includes(q)
  );

  if (results.length === 0) return documents.slice(0,3);

  return results;

}

app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message;

    const docs = retrieveDocs(userMessage);

    const context = docs.map(d => d.text).join("\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are the AI twin of Abhishek Kalyan answering recruiter questions about his resume."
        },
        {
          role: "user",
          content: `Resume information:\n${context}\n\nQuestion: ${userMessage}`
        }
      ]
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "AI server error."
    });

  }

});

app.post("/interview", (req,res)=>{

  const questions = [
    "Tell me about a leadership challenge you handled.",
    "How do you improve operational performance?",
    "Explain a project where you reduced backlog.",
    "How do you mentor new associates?"
  ];

  const q = questions[Math.floor(Math.random()*questions.length)];

  res.json({question:q});

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("AI Twin backend running");
});
