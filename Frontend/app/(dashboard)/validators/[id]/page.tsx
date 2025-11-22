"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { useAppStore } from "@/store/app-store"
import { formatDate, formatNumber } from "@/lib/utils"

type ValidatorDetailPageProps = {
  params: { id: string }
}

export default function ValidatorDetailPage({ params }: ValidatorDetailPageProps) {
  const { validators, blocks } = useAppStore((state) => ({
    validators: state.validators,
    blocks: state.blocks,
  }))

  const validator = validators.find((entry) => entry.id === params.id)
  if (!validator) {
    notFound()
    return null
  }

  const producedBlocks = blocks.filter((block) => block.validatorId === validator.id)

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{validator.name}</CardTitle>
          <CardDescription>{validator.location}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Metric label="Stake" value={`${formatNumber(validator.totalStake)} BLK`} />
          <Metric label="Commission" value={`${validator.commission}%`} />
          <Metric label="Uptime" value={`${validator.uptime}%`} />
          <Metric label="Blocks produced" value={formatNumber(validator.blocksProduced)} />
          <Metric label="Last active" value={formatDate(validator.lastActive)} />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={validator.status} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent blocks</CardTitle>
          <CardDescription>Blocks proposed by {validator.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Block</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {producedBlocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell>
                      <Link href={`/blocks/${block.id}`} className="hover:underline">
                        {block.id}
                      </Link>
                    </TableCell>
                    <TableCell>{block.height}</TableCell>
                    <TableCell>{block.transactionIds.length}</TableCell>
                    <TableCell>{formatDate(block.timestamp)}</TableCell>
                    <TableCell>
                      <StatusBadge status={block.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {producedBlocks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No blocks recorded for this validator.
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}

