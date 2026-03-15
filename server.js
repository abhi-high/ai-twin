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

const knowledge = JSON.parse(
  fs.readFileSync("./src/knowledge.json", "utf8")
);

let messageCount = 0;

function retrieveKnowledge(question) {
  const q = question.toLowerCase();

  const results = knowledge.filter(k =>
    q.includes(k.topic)
  );

  return results.map(r => r.text).join("\n");
}

app.post("/chat", async (req, res) => {

  try {

    const { message, mode } = req.body;

    messageCount++;

    const context = retrieveKnowledge(message);

    if (!context) {
      return res.json({
        reply:
          "I can only answer questions about Abhishek Kalyan's experience and career."
      });
    }

    const prompt = `
You are Abhishek Kalyan's AI resume assistant.

Only answer using the provided knowledge.

Knowledge:
${context}

Recruiter question:
${message}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an AI resume assistant." },
        { role: "user", content: prompt }
      ]
    });

    let reply = completion.choices[0].message.content;

    if (messageCount === 3) {
      const funFact = knowledge.find(k => k.topic === "funfact");
      if (funFact) {
        reply += "\n\n" + funFact.text;
      }
    }

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "AI server error." });
  }
});

app.post("/interview", async (req, res) => {

  const questions = [
    "Tell me about a leadership challenge you faced.",
    "How do you improve team performance?",
    "Explain a project where you improved operational efficiency."
  ];

  const q = questions[Math.floor(Math.random() * questions.length)];

  res.json({ question: q });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("AI Twin backend running");
});