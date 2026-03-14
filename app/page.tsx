'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/navbar'
import { FilterSidebar, type Filters } from '@/components/filter-sidebar'
import { JobCard } from '@/components/job-card'
import { JobDetailModal } from '@/components/job-detail-modal'
import { mockJobs, type Job } from '@/lib/job-data'
import { Briefcase } from 'lucide-react'

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

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      // Search query filter
      if (activeSearchQuery) {
        const query = activeSearchQuery.toLowerCase()
        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.summary.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Job title filter
      if (activeFilters.jobTitle) {
        const titleQuery = activeFilters.jobTitle.toLowerCase()
        if (!job.title.toLowerCase().includes(titleQuery)) return false
      }

      // Location filter
      if (activeFilters.location && activeFilters.location !== 'all') {
        if (job.location !== activeFilters.location) return false
      }

      // Job type filter
      if (activeFilters.jobTypes.length > 0) {
        if (!activeFilters.jobTypes.includes(job.jobType)) return false
      }

      // Salary range filter
      const [minSalary, maxSalary] = activeFilters.salaryRange
      if (job.salaryMax < minSalary || job.salaryMin > maxSalary) return false

      // Experience filter
      if (activeFilters.experience && activeFilters.experience !== 'all') {
        if (job.experience !== activeFilters.experience) return false
      }

      return true
    })
  }, [activeSearchQuery, activeFilters])

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
  }

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
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
      />

      {/* Main content */}
      <main className="pt-[105px] pb-8 md:pt-[57px] lg:ml-72">
        <div className="px-4 py-6 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Discover Your Next Opportunity
            </h1>
            <p className="mt-1 text-muted-foreground">
              {filteredJobs.length} jobs found
              {activeSearchQuery && (
                <span>
                  {' '}
                  for &quot;{activeSearchQuery}&quot;
                </span>
              )}
            </p>
          </div>

          {/* Job Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
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
