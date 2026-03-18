'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/navbar'
import { FilterSidebar, type Filters } from '@/components/filter-sidebar'
import { JobCard } from '@/components/job-card'
import { JobDetailModal } from '@/components/job-detail-modal'
import { type Job } from '@/lib/job-data'
import { useJobs } from '@/hooks/useJobs'
import { Briefcase, Loader2 } from 'lucide-react'
import { JobCardSkeletonGrid } from '@/components/job-card-skeleton'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const defaultFilters: Filters = {
  jobTitle: '',
  location: 'all',
  jobTypes: [],
  salaryRange: [0, 20] as [number, number],
  experience: 'all',
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [activeFilters, setActiveFilters] = useState<Filters>(defaultFilters)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [matchedJobs, setMatchedJobs] = useState<Job[] | null>(null)
  const [isMatching, setIsMatching] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)

  const { jobs, loading, error } = useJobs({
    role: activeFilters.jobTitle || activeSearchQuery,
    location: activeFilters.location,
    minSalary: activeFilters.salaryRange[0],
    maxSalary: activeFilters.salaryRange[1],
    jobType: activeFilters.jobTypes[0] || '',
  })

  // Use matched jobs if available, otherwise use regular jobs
  const displayJobs = matchedJobs || jobs

  // Apply client side search on top
  const filteredJobs = useMemo(() => {
    if (!activeSearchQuery) return displayJobs
    const query = activeSearchQuery.toLowerCase()
    return displayJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.summary.toLowerCase().includes(query)
    )
  }, [displayJobs, activeSearchQuery])

  const handleSearch = () => {
    setActiveSearchQuery(searchQuery)
  }

  const handleApplyFilters = () => {
    setActiveFilters(filters)
    setIsSidebarOpen(false)
  }

  const handleResetFilters = () => {
    setFilters(defaultFilters)
    setActiveFilters(defaultFilters)
    setMatchedJobs(null)
    setResumeUploaded(false)
  }

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
  }

  // Resume matching handler
  const handleResumeMatch = async (resumeText: string) => {
    try {
      setIsMatching(true)

      const jobsToMatch = jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.fullDescription,
      }))

      const response = await fetch(`${API_URL}/api/jobs/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobs: jobsToMatch,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Merge match scores back into full job objects
        const scoredJobs = data.jobs.map((scoredJob: any) => {
          const fullJob = jobs.find((j) => j.id === scoredJob.id)
          return {
            ...fullJob,
            matchScore: scoredJob.matchScore,
            matchReason: scoredJob.matchReason,
          }
        })

        setMatchedJobs(scoredJobs)
        setResumeUploaded(true)
      }
    } catch (error) {
      console.error('Resume match error:', error)
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onResumeMatch={handleResumeMatch}
        isMatching={isMatching}
        resumeUploaded={resumeUploaded}
      />

      <main className="pt-[105px] pb-8 md:pt-[57px] lg:ml-72">
        <div className="px-4 py-6 md:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Discover Your Next Opportunity
            </h1>
            <p className="mt-1 text-muted-foreground">
              {loading ? 'Loading jobs...' : `${filteredJobs.length} jobs found`}
              {resumeUploaded && !loading && (
                <span className="ml-2 text-primary text-sm">
                  ✦ Sorted by resume match
                </span>
              )}
              {activeSearchQuery && !loading && (
                <span> for &quot;{activeSearchQuery}&quot;</span>
              )}
            </p>
          </div>

          {/* Loading State */}
{loading && !isMatching && (
  <JobCardSkeletonGrid />
)}

{/* Matching State */}
{isMatching && (
  <div className="flex flex-col items-center justify-center py-16">
    <Loader2 className="size-10 animate-spin text-primary" />
    <p className="mt-4 text-muted-foreground">
      Matching your resume with jobs...
    </p>
  </div>
)}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                <Briefcase className="size-8 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Something went wrong
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Could not connect to the server. Make sure your backend is running.
              </p>
            </div>
          )}

          {/* Job Grid */}
          {!loading && !error && !isMatching && filteredJobs.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && !isMatching && filteredJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary">
                <Briefcase className="size-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                No jobs found
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}

        </div>
      </main>

      <JobDetailModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}