// controllers/jobsController.js

const { fetchAdzunaJobs } = require('../services/adzuna')
const { fetchJSearchJobs } = require('../services/jsearch')
const { saveJobs, getJobs, hasFreshJobs, updateJobSummary } = require('../db/supabase')
const { summarizeJob, scoreResumeAgainstJobs } = require('../services/ai')

// Existing controller — get jobs
const getJobsController = async (req, res) => {
  try {
    const filters = {
      role: req.query.role || '',
      location: req.query.location || '',
      minSalary: req.query.minSalary || null,
      maxSalary: req.query.maxSalary || null,
      jobType: req.query.jobType || '',
    }

    const freshJobsExist = await hasFreshJobs(filters)

    if (freshJobsExist) {
      console.log('Serving jobs from Supabase cache...')
      const jobs = await getJobs(filters)
      return res.json({
        success: true,
        source: 'cache',
        count: jobs.length,
        jobs,
      })
    }

    console.log('Fetching fresh jobs from APIs...')

    const [adzunaJobs, jsearchJobs] = await Promise.all([
      fetchAdzunaJobs(filters),
      fetchJSearchJobs(filters),
    ])

    const allJobs = [...adzunaJobs, ...jsearchJobs]

    if (allJobs.length === 0) {
      return res.json({
        success: true,
        source: 'api',
        count: 0,
        jobs: [],
      })
    }

    await saveJobs(allJobs)
    const filteredJobs = await getJobs(filters)

    return res.json({
      success: true,
      source: 'api',
      count: filteredJobs.length,
      jobs: filteredJobs,
    })

  } catch (error) {
    console.error('Jobs controller error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching jobs',
    })
  }
}

// New controller — summarize a single job
const summarizeJobController = async (req, res) => {
  try {
    const { jobId, title, company, description } = req.body

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required',
      })
    }

    console.log(`Summarizing job: ${title} at ${company}`)

    const summary = await summarizeJob(title, company, description)

    // Save summary to Supabase so we never call AI again for this job
    if (jobId && summary.length > 0) {
      await updateJobSummary(jobId, summary)
    }

    return res.json({
      success: true,
      summary,
    })

  } catch (error) {
    console.error('Summarize controller error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while summarizing job',
    })
  }
}

// New controller — match resume against jobs
const matchResumeController = async (req, res) => {
  try {
    const { resumeText, jobs } = req.body

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required',
      })
    }

    if (!jobs || jobs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Jobs list is required',
      })
    }

    console.log(`Scoring resume against ${jobs.length} jobs...`)

    const scoredJobs = await scoreResumeAgainstJobs(resumeText, jobs)

    // Sort by match score highest first
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore)

    return res.json({
      success: true,
      jobs: scoredJobs,
    })

  } catch (error) {
    console.error('Match controller error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while matching resume',
    })
  }
}
// New controller — extract text from PDF resume
const extractResumeController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded',
      })
    }

    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs')
    const uint8Array = new Uint8Array(req.file.buffer)
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
    const pdf = await loadingTask.promise

    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item) => item.str).join(' ')
      fullText += pageText + '\n'
    }

    if (!fullText || fullText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF',
      })
    }

    return res.json({
      success: true,
      resumeText: fullText.trim(),
    })

  } catch (error) {
    console.error('PDF extract error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to process PDF file',
    })
  }
}

module.exports = { 
  getJobsController, 
  summarizeJobController, 
  matchResumeController,
  extractResumeController
}