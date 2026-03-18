// services/jsearch.js

const axios = require('axios')

const fetchJSearchJobs = async (filters = {}) => {
  try {
    const { role = 'software engineer', location = '', page = 1 } = filters

    const query = location ? `${role} in ${location}` : `${role} jobs`

    const response = await axios.get(
      'https://jsearch.p.rapidapi.com/search',
      {
        params: {
          query: query,
          page: page,
          num_pages: 2,
          date_posted: 'all',
          remote_jobs_only: 'false',
        },
        headers: {
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
          'x-rapidapi-key': process.env.JSEARCH_API_KEY,
        },
      }
    )

    const jobs = response.data.data.map((job) => ({
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ''} ${job.job_country || ''}`.trim(),
      salary_min: job.job_min_salary || null,
      salary_max: job.job_max_salary || null,
      job_type: job.job_employment_type || 'full_time',
      description: job.job_description,
      apply_url: job.job_apply_link,
      source: 'jsearch',
      fetched_at: new Date().toISOString(),
    }))

    return jobs

  } catch (error) {
    console.error('JSearch API error:', error.response?.data || error.message)
    return []
  }
}

module.exports = { fetchJSearchJobs }