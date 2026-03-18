'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, MapPin, Clock, Sparkles } from 'lucide-react'
import type { Job } from '@/lib/job-data'

interface JobCardProps {
  job: Job
  onViewDetails: (job: Job) => void
}

export function JobCard({ job, onViewDetails }: JobCardProps) {
  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Salary not specified'
    if (min === 0 && max === 0) return 'Salary not specified'
    if (min < 1) return `₹${min * 100}K - ₹${max}L`
    return `₹${min}L - ₹${max}L`
  }

  const getJobTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'Full-time':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'Part-time':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Internship':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'Contract':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }

  // Clean up summary text
  const cleanSummary = job.summary
    ? job.summary.replace(/\\n/g, ' ').replace(/\n/g, ' ').slice(0, 150) + '...'
    : 'No description available'

  const salaryText = formatSalary(job.salaryMin, job.salaryMax)
  const isLive = job.postedDays === 0

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">

      {/* Top right — match score or posted time */}
      <div className="absolute top-4 right-4">
        {job.matchScore > 0 ? (
          <Badge className={`${getMatchScoreColor(job.matchScore)} text-xs`}>
            <Sparkles className="mr-1 size-3" />
            {job.matchScore}% Match
          </Badge>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {isLive ? 'Live' : `${job.postedDays} days ago`}
          </span>
        )}
      </div>

      {/* Company logo and info */}
      <div className="mb-4 flex items-start gap-3">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${job.companyColor}`}
        >
          <span className="text-sm font-bold text-white">
            {job.companyInitials}
          </span>
        </div>
        <div className="min-w-0 pr-16">
          <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="truncate text-sm text-muted-foreground">{job.company}</p>
        </div>
      </div>

      {/* Location and job type */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3" />
          {job.location || 'Location not specified'}
        </span>
        <Badge className={`${getJobTypeBadgeVariant(job.jobType)} text-xs`}>
          {job.jobType}
        </Badge>
      </div>

      {/* Salary */}
      <p className="mb-3 text-sm font-medium text-foreground">
        {salaryText}
        {salaryText !== 'Salary not specified' && (
          <span className="font-normal text-muted-foreground"> per annum</span>
        )}
      </p>

      {/* Summary */}
      <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {cleanSummary}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails(job)}
        >
          View Details
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          onClick={() => window.open(job.applyLink, '_blank')}
        >
          <span>Apply Now</span>
          <ExternalLink className="ml-1 size-3" />
        </Button>
      </div>
    </div>
  )
}