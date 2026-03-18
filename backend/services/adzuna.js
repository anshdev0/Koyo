// services/adzuna.js

const axios = require('axios')

const fetchAdzunaJobs = async (filters = {}) => {
  try {
    const { role = 'software engineer', location = '', page = 1 } = filters

    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/gb/search/${page}`,
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          what: role,
          where: location || undefined,
          results_per_page: 20,
          content_type: 'application/json',
        },
      }
    )

    // Clean and format the data
    const jobs = response.data.results.map((job) => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      job_type: job.contract_time || 'full_time',
      description: job.description,
      apply_url: job.redirect_url,
      source: 'adzuna',
      fetched_at: new Date().toISOString(),
    }))

    return jobs

  } catch (error) {
  console.error('Adzuna API error:', error.response?.data || error.message)
  return []
}
}

module.exports = { fetchAdzunaJobs }