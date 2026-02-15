"use client"

import Link from "next/link"
import { BookOpen, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import type { ModuleSearchResult, UserSearchResult } from "@/lib/search"

interface SearchResultsProps {
  modules: ModuleSearchResult[]
  users: UserSearchResult[]
  onSelect: () => void
}

export function SearchResults({ modules, users, onSelect }: SearchResultsProps) {
  return (
    <>
      {modules.length > 0 && (
        <CommandGroup heading="모듈">
          {modules.map((mod) => (
            <CommandItem key={mod.id} asChild onSelect={onSelect}>
              <Link href={`/session/${mod.id}`} className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{mod.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {mod.subtitle}
                  </span>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {mod.tag}
                </Badge>
              </Link>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {modules.length > 0 && users.length > 0 && <CommandSeparator />}

      {users.length > 0 && (
        <CommandGroup heading="사용자">
          {users.map((user) => (
            <CommandItem key={user.id} onSelect={onSelect}>
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  )
}
