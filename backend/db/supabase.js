// db/supabase.js

const { createClient } = require('@supabase/supabase-js')

// Create the Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Save jobs to Supabase
const saveJobs = async (jobs) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .upsert(jobs, { onConflict: 'apply_url' })

    if (error) throw error

    console.log(`Saved ${jobs.length} jobs to Supabase`)
    return data

  } catch (error) {
    console.error('Error saving jobs:', error.message)
    return null
  }
}

// Get jobs from Supabase with optional filters
const getJobs = async (filters = {}) => {
  try {
    const { role, location, minSalary, maxSalary, jobType } = filters

    let query = supabase.from('jobs').select('*')

    // Apply filters only if they are provided
    if (role) {
      query = query.ilike('title', `%${role}%`)
    }
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    if (minSalary) {
      query = query.gte('salary_min', minSalary)
    }
    if (maxSalary) {
      query = query.lte('salary_max', maxSalary)
    }
    if (jobType) {
      query = query.eq('job_type', jobType)
    }

    const { data, error } = await query

    if (error) throw error

    return data

  } catch (error) {
    console.error('Error getting jobs:', error.message)
    return []
  }
}

// Check if we have fresh jobs (fetched less than 3 hours ago)
const hasFreshJobs = async (filters = {}) => {
  try {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .gte('fetched_at', threeHoursAgo)
      .limit(1)

    if (error) throw error

    return data.length > 0

  } catch (error) {
    console.error('Error checking fresh jobs:', error.message)
    return false
  }
}
// Update job with AI summary
const updateJobSummary = async (jobId, summary) => {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({ ai_summary: summary })
      .eq('id', jobId)

    if (error) throw error
    console.log(`Updated summary for job ${jobId}`)

  } catch (error) {
    console.error('Error updating job summary:', error.message)
  }
}

module.exports = { saveJobs, getJobs, hasFreshJobs, updateJobSummary }