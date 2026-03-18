// services/ai.js

const Groq = require('groq-sdk')

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Feature 1 — Summarize a job description into 3 bullet points
const summarizeJob = async (jobTitle, company, description) => {
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `You are a job summarizer. Summarize this job posting into exactly 3 short bullet points. Each bullet point should be one line. Cover: 1) Main skills/tech required 2) What the person will do 3) Company/role benefit.

Job Title: ${jobTitle}
Company: ${company}
Description: ${description}

Return ONLY the 3 bullet points, nothing else. Format:
- [point 1]
- [point 2]  
- [point 3]`,
        },
      ],
    })

    const responseText = response.choices[0].message.content
    const lines = responseText.split('\n').filter((line) => line.trim().length > 10)
    const bullets = lines.slice(0, 3).map((line) => 
    line.trim().replace(/^[•\-\*1-9]\.\s*|^[•\-\*]\s*/, '')
)

    return bullets.slice(0, 3)

  } catch (error) {
    console.error('AI summarize error:', error.message)
    return []
  }
}

// Feature 2 — Score a resume against a single job
const scoreResumeAgainstJob = async (resumeText, jobTitle, jobDescription) => {
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are a recruitment expert. Score how well this resume matches the job.

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Resume:
${resumeText}

Return ONLY a JSON object like this, nothing else:
{"score": 8, "reason": "Strong React experience matches requirements, but missing AWS skills"}

Score from 1-10. Be honest and realistic.`,
        },
      ],
    })

    const responseText = response.choices[0].message.content
    const cleaned = responseText.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    return {
      score: result.score,
      reason: result.reason,
    }

  } catch (error) {
    console.error('AI scoring error:', error.message)
    return { score: 0, reason: 'Could not score this job' }
  }
}

// Feature 2b — Score resume against multiple jobs at once
const scoreResumeAgainstJobs = async (resumeText, jobs) => {
  try {
    const scoringPromises = jobs.map((job) =>
      scoreResumeAgainstJob(resumeText, job.title, job.description)
    )

    const scores = await Promise.all(scoringPromises)

    return jobs.map((job, index) => ({
      ...job,
      matchScore: scores[index].score * 10,
      matchReason: scores[index].reason,
    }))

  } catch (error) {
    console.error('AI bulk scoring error:', error.message)
    return jobs
  }
}

module.exports = { summarizeJob, scoreResumeAgainstJobs }