import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Load knowledge base
const knowledge = JSON.parse(
  fs.readFileSync("./src/knowledge.json", "utf-8")
);

// Simple retrieval
function retrieveContext(question) {

  const q = question.toLowerCase();

  const docs = knowledge.filter(doc =>
    doc.text.toLowerCase().includes(q.split(" ")[0])
  );

  return docs.slice(0,3).map(d => d.text).join("\n");
}

app.post("/chat", async (req, res) => {

  const userMessage = req.body.message;

  const context = retrieveContext(userMessage);

  const prompt = `
You are Abhishek Kalyan's AI Resume Assistant.

Use the following resume knowledge to answer recruiter questions.

Resume Knowledge:
${context}

Recruiter Question:
${userMessage}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are an AI resume assistant helping recruiters learn about Abhishek Kalyan."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    stream: true
  });

  res.setHeader("Content-Type", "text/plain");

  for await (const chunk of completion) {

    const token = chunk.choices[0]?.delta?.content || "";

    res.write(token);
  }

  res.end();

});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`AI Twin server running on port ${PORT}`);
});