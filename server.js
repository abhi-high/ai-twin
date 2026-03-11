require("dotenv").config()

const express = require("express")
const cors = require("cors")
const Groq = require("groq-sdk")
const fs = require("fs")

const app = express()
app.use(cors())
app.use(express.json())

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

/*
LOAD KNOWLEDGE
*/

const knowledge = JSON.parse(
  fs.readFileSync("./src/knowledge.json", "utf8")
)

/*
TRACK QUESTION COUNT
*/

let questionCount = 0

/*
BUILD CONTEXT
*/

function buildContext(includeFunFact) {

  let context = `
You are the AI assistant representing Abhishek Kalyan.

Answer ONLY using the knowledge provided.

PROFILE
Name: ${knowledge.profile.name}
Role: ${knowledge.profile.role}
Company: ${knowledge.profile.company}
Location: ${knowledge.profile.location}
Experience: ${knowledge.profile.experience}

CAREER PROGRESSION
${knowledge.career_progression.join(" → ")}

LEADERSHIP EXPERIENCE
Supports ${knowledge.leadership_experience.associates_supported} associates
Mentored ${knowledge.leadership_experience.mentored_associates_per_year} associates per year
Interviewed and onboarded ${knowledge.leadership_experience.associates_interviewed} associates

IMPACT METRICS
Escalation Reduction: ${knowledge.impact_metrics.escalation_reduction}
Repeat Issue Reduction: ${knowledge.impact_metrics.repeat_issue_reduction}
Audit Improvement: ${knowledge.impact_metrics.audit_adherence_improvement}
Carry Forward Reduction: ${knowledge.impact_metrics.carry_forward_work_reduction}

OPERATIONS EXPERIENCE
${knowledge.operations_experience.join("\n")}

PROJECTS
${knowledge.projects.map(p => `${p.name}: ${p.description}`).join("\n")}

SKILLS
${knowledge.skills.join(", ")}

EDUCATION
${knowledge.education.degree} – ${knowledge.education.university}

LANGUAGES
${knowledge.languages.join(", ")}

If a question is unrelated to Abhishek's professional background, politely explain that you can only answer questions about his experience and career.
`

  if (includeFunFact) {
    const randomFact = knowledge.fun_facts[
      Math.floor(Math.random() * knowledge.fun_facts.length)
    ]

    context += `

After answering the question, add this leadership fun fact:

"${randomFact}"
`
  } else {
    context += `

After answering normally, encourage the user to ask more questions by saying:

"Ask a few more questions to unlock a leadership fun fact about Abhishek."
`
  }

  return context
}

/*
ROOT
*/

app.get("/", (req, res) => {
  res.send("AI Twin Backend Running")
})

/*
CHAT
*/

app.post("/chat", async (req, res) => {

  try {

    questionCount++

    const includeFunFact = questionCount % 3 === 0

    const context = buildContext(includeFunFact)

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: context },
        { role: "user", content: req.body.message }
      ]
    })

    res.json({
      reply: completion.choices[0].message.content
    })

  } catch (error) {

    console.error(error)

    res.json({
      reply: "Server error occurred."
    })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("AI Server running on port", PORT)
})