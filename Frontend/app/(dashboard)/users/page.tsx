"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/app-store"
import { formatDate } from "@/lib/utils"

export default function UsersPage() {
  const { users, wallets, currentUser } = useAppStore((state) => ({
    users: state.users,
    wallets: state.wallets,
    currentUser: state.currentUser,
  }))

  const [query, setQuery] = useState("")

  const walletCounts = useMemo(() => {
    return wallets.reduce<Record<string, number>>((acc, wallet) => {
      acc[wallet.userId] = (acc[wallet.userId] ?? 0) + 1
      return acc
    }, {})
  }, [wallets])

  const filteredUsers = useMemo(() => {
    if (!query) return users
    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()),
    )
  }, [users, query])

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="View all registered users." />

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Click on a user to open their profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput placeholder="Search user by name or email..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Wallets</TableHead>
                  <TableHead>Last login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link href={`/users/${user.id}`} className="font-medium hover:underline">
                        {user.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>{walletCounts[user.id] ?? 0}</TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

