// routes/jobs.js

const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { 
  getJobsController, 
  summarizeJobController, 
  matchResumeController,
  extractResumeController
} = require('../controllers/jobsController')

// GET /api/jobs
router.get('/', getJobsController)

// POST /api/jobs/summarize
router.post('/summarize', summarizeJobController)

// POST /api/jobs/match
router.post('/match', matchResumeController)

// POST /api/jobs/extract-resume
router.post('/extract-resume', upload.single('resume'), extractResumeController)

module.exports = router