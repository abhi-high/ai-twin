require ("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Resume Knowledge Base
const resumeContext = `
You are an AI twin of Abhishek Kalyan.
Answer ONLY using the information below.
Do not make up or assume anything.

PROFILE:
Abhishek Kalyan
SPS Associate Advisor (Delivery Team Leader)
Amazon Development Center Pvt. Ltd.
Hyderabad, India
9+ years experience in Customer Support & Operations Leadership

CURRENT ROLE IMPACT:
- Leading 186 associates
- 30% escalation reduction
- 20% repeat issue reduction
- 20% audit adherence improvement
- Interviewed & onboarded 18 associates
- Uses SQL & Power BI dashboards
- Works with AWS console tools

MAJOR PROJECTS:
Project Velocity – 35% backlog reduction, $280K savings
Project Sigma – 18% deviation reduction, $320K savings
Project Nexus – 30% onboarding reduction, $150K savings

CAREER PROGRESSION:
SPS Associate → SPS Mentor → Delivery Team Leader

SKILLS:
Team Leadership
Sprint Planning
Backlog Prioritization
KPI & SLA Management
SQL
Power BI
AWS Tools
Lean Six Sigma Yellow Belt

EDUCATION:
B.Sc Computer Science (2013–2016)
William Carey University

LANGUAGES:
English, Tamil, Telugu, Hindi, Marathi

INSTRUCTION:
After answering, always add one short witty professional fun fact about Abhishek related to leadership or operations.
If information is not in the above data, say:
"I do not have that information available."
`;

app.post("/chat", async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: resumeContext },
        { role: "user", content: req.body.message }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    res.json({ reply: "Server error occurred." });
  }
});

app.listen(5000, () => {
  console.log("AI Server running on http://localhost:5000");
});