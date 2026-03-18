'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { SlidersHorizontal, X, FileText, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

export interface Filters {
  jobTitle: string
  location: string
  jobTypes: string[]
  salaryRange: [number, number]
  experience: string
}

interface FilterSidebarProps {
  filters: Filters
  setFilters: (filters: Filters) => void
  onApply: () => void
  onReset: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onResumeMatch: (resumeText: string) => void
  isMatching: boolean
  resumeUploaded: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

const locations = ['Remote', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune']
const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract']
const experienceLevels = ['Fresher', '1-3 years', '3-5 years', '5+ years']

export function FilterSidebar({
  filters,
  setFilters,
  onApply,
  onReset,
  isOpen,
  setIsOpen,
  onResumeMatch,
  isMatching,
  resumeUploaded,
}: FilterSidebarProps) {
  const [resumeText, setResumeText] = useState('')
  const [showResumeInput, setShowResumeInput] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const handleJobTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFilters({ ...filters, jobTypes: [...filters.jobTypes, type] })
    } else {
      setFilters({
        ...filters,
        jobTypes: filters.jobTypes.filter((t) => t !== type),
      })
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('resume', file)

    try {
      setPdfLoading(true)
      const response = await fetch(`${API_URL}/api/jobs/extract-resume`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setResumeText(data.resumeText)
      }
    } catch (error) {
      console.error('PDF upload error:', error)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleMatchResume = () => {
    if (!resumeText.trim()) return
    onResumeMatch(resumeText)
    setShowResumeInput(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile filter button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg lg:hidden"
      >
        <SlidersHorizontal className="size-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-72 overflow-y-auto border-r border-border bg-sidebar pt-[57px] transition-transform duration-300 lg:left-0 lg:z-30 lg:translate-x-0 ${
          isOpen ? 'left-0 translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
          <h2 className="text-sm font-semibold">Filters</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4">
          <h2 className="mb-6 hidden text-sm font-semibold text-muted-foreground lg:block">
            Filters
          </h2>

          <div className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Title</Label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer"
                value={filters.jobTitle}
                onChange={(e) =>
                  setFilters({ ...filters, jobTitle: e.target.value })
                }
                className="h-9 w-full rounded-md border border-border bg-input px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Location</Label>
              <Select
                value={filters.location}
                onValueChange={(value) =>
                  setFilters({ ...filters, location: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Job Type</Label>
              <div className="space-y-2">
                {jobTypes.map((type) => (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <Checkbox
                      checked={filters.jobTypes.includes(type)}
                      onCheckedChange={(checked) =>
                        handleJobTypeChange(type, checked as boolean)
                      }
                    />
                    <span className="text-sm text-foreground">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Salary Range</Label>
                <span className="text-xs text-muted-foreground">
                  ₹{filters.salaryRange[0]}L - ₹{filters.salaryRange[1]}L
                </span>
              </div>
              <Slider
                value={filters.salaryRange}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    salaryRange: value as [number, number],
                  })
                }
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹0 LPA</span>
                <span>₹20 LPA</span>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Experience Level</Label>
              <Select
                value={filters.experience}
                onValueChange={(value) =>
                  setFilters({ ...filters, experience: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {experienceLevels.map((exp) => (
                    <SelectItem key={exp} value={exp}>
                      {exp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resume Match Section */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <Label className="text-sm font-medium">AI Resume Match</Label>
              </div>

              {/* Already matched state */}
              {resumeUploaded && !showResumeInput && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">
                    Resume matched! Jobs sorted by fit.
                  </span>
                </div>
              )}

              {/* Toggle resume input */}
              {!showResumeInput && (
                <button
                  onClick={() => setShowResumeInput(true)}
                  className="w-full rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-3 text-center text-xs text-primary hover:bg-primary/10 transition-colors"
                >
                  <FileText className="mx-auto mb-1 size-4" />
                  {resumeUploaded ? 'Update Resume' : 'Upload Resume to Get Match Scores'}
                </button>
              )}

              {/* Resume PDF upload */}
              {showResumeInput && (
                <div className="space-y-2">
                  <div
                    className="w-full rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 px-3 py-4 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    {pdfLoading ? (
                      <>
                        <Loader2 className="mx-auto mb-2 size-6 text-primary animate-spin" />
                        <p className="text-xs text-primary font-medium">
                          Reading PDF...
                        </p>
                      </>
                    ) : (
                      <>
                        <FileText className="mx-auto mb-2 size-6 text-primary" />
                        <p className="text-xs text-primary font-medium">
                          {resumeText ? '✓ PDF Loaded — Click to change' : 'Click to upload PDF resume'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 5MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleMatchResume}
                      disabled={!resumeText.trim() || isMatching || pdfLoading}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 text-xs"
                      size="sm"
                    >
                      {isMatching ? (
                        <>
                          <Loader2 className="mr-1 size-3 animate-spin" />
                          Matching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1 size-3" />
                          Find My Matches
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowResumeInput(false)
                        setResumeText('')
                      }}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onApply}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={onReset}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}