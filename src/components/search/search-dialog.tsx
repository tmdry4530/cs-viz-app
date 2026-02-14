"use client"

import { useCallback, useEffect, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command"
import { SearchResults } from "@/components/search/search-results"
import { searchModules, searchUsers } from "@/lib/search"
import type { ModuleSearchResult, UserSearchResult } from "@/lib/search"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [moduleResults, setModuleResults] = useState<ModuleSearchResult[]>([])
  const [userResults, setUserResults] = useState<UserSearchResult[]>([])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (value.trim().length < 2) {
      setModuleResults([])
      setUserResults([])
      return
    }
    setModuleResults(searchModules(value))
    setUserResults(searchUsers(value))
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setQuery("")
    setModuleResults([])
    setUserResults([])
  }, [])

  const hasResults = moduleResults.length > 0 || userResults.length > 0

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="모듈, 사용자 검색... (최소 2자)"
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        {query.trim().length >= 2 && !hasResults && (
          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        )}
        {hasResults && (
          <SearchResults
            modules={moduleResults}
            users={userResults}
            onSelect={handleClose}
          />
        )}
      </CommandList>
    </CommandDialog>
  )
}
