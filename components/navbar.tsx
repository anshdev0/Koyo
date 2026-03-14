'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearch: () => void
}

export function Navbar({ searchQuery, setSearchQuery, onSearch }: NavbarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <span className="text-sm font-bold text-primary-foreground">K</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Koyō</span>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search job title, keywords, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          onClick={onSearch}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
        >
          Find Jobs
        </Button>
      </div>

      {/* Mobile search */}
      <div className="border-t border-border px-4 py-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </header>
  )
}
