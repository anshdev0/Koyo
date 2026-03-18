'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ExternalLink,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
  Building2,
  Loader2,
} from 'lucide-react'
import type { Job } from '@/lib/job-data'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface JobDetailModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  const [aiSummary, setAiSummary] = useState<string[]>([])
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Fetch AI summary when modal opens
  useEffect(() => {
    if (!job || !isOpen) return

    // If job already has a summary, use it
    if (job.aiSummary && job.aiSummary.length > 0) {
      setAiSummary(job.aiSummary)
      return
    }

    // Otherwise fetch from backend
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true)
        const response = await fetch(`${API_URL}/api/jobs/summarize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.id,
            title: job.title,
            company: job.company,
            description: job.fullDescription,
          }),
        })

        const data = await response.json()
        if (data.success && data.summary.length > 0) {
          setAiSummary(data.summary)
        }
      } catch (error) {
        console.error('Error fetching summary:', error)
      } finally {
        setSummaryLoading(false)
      }
    }

    fetchSummary()
  }, [job, isOpen])

  // Reset summary when modal closes
  useEffect(() => {
    if (!isOpen) setAiSummary([])
  }, [isOpen])

  if (!job) return null

  const formatSalary = (min: number, max: number) => {
    if (min === 0 && max === 0) return 'Salary not specified'
    if (min < 1) return `₹${min * 100}K - ₹${max}L`
    return `₹${min}L - ₹${max}L`
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${job.companyColor}`}
              >
                <span className="text-lg font-bold text-white">
                  {job.companyInitials}
                </span>
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {job.title}
                </DialogTitle>
                <DialogDescription className="mt-1 text-muted-foreground">
                  {job.company}
                </DialogDescription>
              </div>
            </div>
            {job.matchScore > 0 && (
              <Badge className={`${getMatchScoreColor(job.matchScore)} shrink-0`}>
                {job.matchScore}% Match
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Quick info */}
          <div className="flex flex-wrap gap-4 rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="size-4 text-muted-foreground" />
              <span>{job.jobType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="size-4 text-muted-foreground" />
              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" />
              <span>{job.experience}</span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                AI Summary
              </span>
            </div>

            {/* Loading state */}
            {summaryLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>Generating AI summary...</span>
              </div>
            )}

            {/* Summary bullets */}
            {!summaryLoading && aiSummary.length > 0 && (
              <ul className="space-y-2">
                {aiSummary.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Empty state */}
            {!summaryLoading && aiSummary.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No summary available for this job.
              </p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Job Description
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {job.fullDescription}
            </p>
          </div>

          {/* Company Info */}
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                About {job.company}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {job.companyInfo}
            </p>
          </div>

          {/* Apply button */}
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            onClick={() => window.open(job.applyLink, '_blank')}
          >
            <span>Apply Now</span>
            <ExternalLink className="ml-2 size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}