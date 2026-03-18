// hooks/useJobs.ts

import { useState, useEffect } from 'react'
import { type Job } from '@/lib/job-data'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Generate a color based on company name
const getCompanyColor = (company: string): string => {
  const colors = [
    'bg-purple-600', 'bg-blue-600', 'bg-pink-600',
    'bg-emerald-600', 'bg-orange-600', 'bg-violet-600',
    'bg-cyan-600', 'bg-rose-600', 'bg-amber-600',
    'bg-indigo-600', 'bg-teal-600', 'bg-red-600',
  ]
  const index = company.charCodeAt(0) % colors.length
  return colors[index]
}

// Get company initials from name
const getCompanyInitials = (company: string): string => {
  return company
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Map backend job to frontend Job type
const mapBackendJob = (backendJob: any, index: number): Job => ({
  id: backendJob.id || String(index),
  title: backendJob.title || 'Untitled Role',
  company: backendJob.company || 'Unknown Company',
  companyInitials: getCompanyInitials(backendJob.company || 'UK'),
  companyColor: getCompanyColor(backendJob.company || ''),
  location: backendJob.location || 'Remote',
  jobType: backendJob.job_type === 'part_time' ? 'Part-time'
    : backendJob.job_type === 'contract' ? 'Contract'
    : backendJob.job_type === 'internship' ? 'Internship'
    : 'Full-time',
  salaryMin: backendJob.salary_min
    ? Math.round(backendJob.salary_min / 100000)
    : 0,
  salaryMax: backendJob.salary_max
    ? Math.round(backendJob.salary_max / 100000)
    : 0,
  experience: 'Not specified',
  summary: backendJob.description
    ? backendJob.description.slice(0, 150) + '...'
    : 'No description available',
  fullDescription: backendJob.description || 'No description available',
  requirements: [],
  companyInfo: `Jobs at ${backendJob.company}`,
  aiSummary: [],
  matchScore: 0,
  postedDays: 0,
  applyLink: backendJob.apply_url || '#',
})

export const useJobs = (filters: {
  role?: string
  location?: string
  minSalary?: number
  maxSalary?: number
  jobType?: string
}) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query string from filters
        const params = new URLSearchParams()
        if (filters.role) params.append('role', filters.role)
        if (filters.location && filters.location !== 'all') {
          params.append('location', filters.location)
        }
        if (filters.minSalary) {
          params.append('minSalary', String(filters.minSalary * 100000))
        }
        if (filters.maxSalary) {
          params.append('maxSalary', String(filters.maxSalary * 100000))
        }
        if (filters.jobType) params.append('jobType', filters.jobType)

        const response = await fetch(
          `${API_URL}/api/jobs?${params.toString()}`
        )

        if (!response.ok) throw new Error('Failed to fetch jobs')

        const data = await response.json()

        if (data.success) {
          const mappedJobs = data.jobs.map(mapBackendJob)
          setJobs(mappedJobs)
          setCount(data.count)
        }

      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [filters.role, filters.location, filters.minSalary, filters.maxSalary, filters.jobType])

  return { jobs, loading, error, count }
}