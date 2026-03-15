import express from "express";
import cors from "cors";
import fs from "fs";
import Groq from "groq-sdk";
import semanticSearch from "./semanticSearch.js";

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const documents = JSON.parse(
  fs.readFileSync("./src/documents.json", "utf8")
);

const knowledge = JSON.parse(
  fs.readFileSync("./src/knowledge.json", "utf8")
);

let conversationHistory = [];
let recruiterQuestions = 0;

const funFacts = knowledge.funFacts || [
  "Abhishek enjoys exploring AI tools and building automation systems.",
  "He has experience leading operational improvements in high volume environments.",
  "He is passionate about Agile and process optimization."
];

app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message;

    recruiterQuestions++;

    const relevantDocs = await semanticSearch(userMessage);

    const context = relevantDocs.join("\n");

    const messages = [
      {
        role: "system",
        content:
          `You are the AI twin of Abhishek Kalyan.

Speak professionally to recruiters.

Answer questions based on resume information.

Be concise, confident and recruiter-friendly.`
      },
      ...conversationHistory,
      {
        role: "user",
        content: `Resume Context:\n${context}\n\nQuestion: ${userMessage}`
      }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages
    });

    let reply = completion.choices[0].message.content;

    conversationHistory.push({ role: "user", content: userMessage });
    conversationHistory.push({ role: "assistant", content: reply });

    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    if (recruiterQuestions % 3 === 0) {

      const fact =
        funFacts[Math.floor(Math.random() * funFacts.length)];

      reply += `\n\nFun fact: ${fact}`;
    }

    res.json({ reply });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "AI server error."
    });

  }

});

app.post("/interview", (req, res) => {

  const questions = [
    "Tell me about a leadership challenge you handled.",
    "How did you improve operational performance at Amazon?",
    "Explain a project where you reduced backlog.",
    "How do you mentor new associates?",
    "How do you use Agile practices in operations?"
  ];

  const q = questions[Math.floor(Math.random() * questions.length)];

  res.json({ question: q });

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("AI Twin backend running");
});