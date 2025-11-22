"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { StatusBadge } from "@/components/status-badge"
import { useAppStore } from "@/store/app-store"
import { formatNumber } from "@/lib/utils"

export default function ValidatorsPage() {
  const { validators, blocks } = useAppStore((state) => ({
    validators: state.validators,
    blocks: state.blocks,
  }))

  const [query, setQuery] = useState("")

  const blocksByValidator = useMemo(() => {
    return blocks.reduce<Record<string, number>>((acc, block) => {
      acc[block.validatorId] = (acc[block.validatorId] ?? 0) + 1
      return acc
    }, {})
  }, [blocks])

  const filteredValidators = useMemo(() => {
    if (!query) return validators
    return validators.filter((validator) =>
      `${validator.name} ${validator.status}`.toLowerCase().includes(query.toLowerCase()),
    )
  }, [validators, query])

  return (
    <div className="space-y-6">
      <PageHeader title="Validators" description="Consensus operators securing the network." />

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Validator registry</CardTitle>
          <CardDescription>Click into a node to inspect its blocks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput placeholder="Search validators..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stake</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValidators.map((validator) => (
                  <TableRow key={validator.id}>
                    <TableCell>
                      <Link href={`/validators/${validator.id}`} className="font-medium hover:underline">
                        {validator.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={validator.status} />
                    </TableCell>
                    <TableCell>{formatNumber(validator.totalStake)} BLK</TableCell>
                    <TableCell>{validator.commission}%</TableCell>
                    <TableCell>{blocksByValidator[validator.id] ?? validator.blocksProduced}</TableCell>
                    <TableCell>{validator.uptime}%</TableCell>
                  </TableRow>
                ))}
                {filteredValidators.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No validators matched your search.
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

