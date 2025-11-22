"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/store/app-store"
import { transactionsApi, p2pApi, usersApi } from "@/lib/api"
import { formatCurrency, formatDate, formatHash, formatNumber } from "@/lib/utils"
import { HashLink } from "@/components/hash-link"
import { CopyButton } from "@/components/copy-button"
import Link from "next/link"

export default function TransactionsHistoryPage() {
  const { currentUser } = useAppStore()
  const [blockchainTxs, setBlockchainTxs] = useState<any[]>([])
  const [p2pTxs, setP2pTxs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (currentUser) {
      loadTransactions()
    }
  }, [currentUser])

  const loadTransactions = async () => {
    if (!currentUser) return
    setIsLoading(true)
    try {
      // Get actual user_id from database
      const userProfile = await usersApi.getProfile(currentUser.id)
      const [blockchain, p2p] = await Promise.all([
        transactionsApi.getAll(100, 0),
        p2pApi.getTransactions({ userId: userProfile.user_id, limit: 100 }),
      ])
      setBlockchainTxs(blockchain)
      setP2pTxs(p2p)
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBlockchainTxs = blockchainTxs.filter((tx) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return tx.hash.toLowerCase().includes(query)
  })

  const filteredP2PTxs = p2pTxs.filter((tx) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      tx.buyer_username?.toLowerCase().includes(query) ||
      tx.seller_username?.toLowerCase().includes(query) ||
      tx.token_symbol?.toLowerCase().includes(query)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "bg-success text-white"
      case "pending":
        return "bg-warning text-white"
      case "failed":
      case "cancelled":
        return "bg-error text-white"
      default:
        return "bg-muted"
    }
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please login to view transaction history</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
        <p className="text-sm text-muted-foreground mt-1">View all your blockchain and P2P transactions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Blockchain and P2P transaction records</CardDescription>
            </div>
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="blockchain" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
              <TabsTrigger value="p2p">P2P Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="blockchain" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hash</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : filteredBlockchainTxs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No blockchain transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBlockchainTxs.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <HashLink hash={tx.hash} href={`/transactions/${tx.id}`} />
                          </TableCell>
                          <TableCell>
                            <Link href={`/tokens/${tx.tokenId}`} className="hover:underline">
                              {tx.tokenId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold">{formatNumber(tx.amount)}</p>
                          </TableCell>
                          <TableCell className="min-w-[200px] max-w-[300px]">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-mono text-foreground break-all flex-1">
                                {tx.fromAddress || tx.fromWalletId || "N/A"}
                              </p>
                              {(tx.fromAddress || tx.fromWalletId) && (
                                <CopyButton 
                                  value={tx.fromAddress || tx.fromWalletId} 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 flex-shrink-0"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[200px] max-w-[300px]">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-mono text-foreground break-all flex-1">
                                {tx.toAddress || tx.toWalletId || "N/A"}
                              </p>
                              {(tx.toAddress || tx.toWalletId) && (
                                <CopyButton 
                                  value={tx.toAddress || tx.toWalletId} 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 flex-shrink-0"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">{formatCurrency(tx.fee)}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</p>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="p2p" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          Loading P2P transactions...
                        </TableCell>
                      </TableRow>
                    ) : filteredP2PTxs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          No P2P transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredP2PTxs.map((tx) => (
                        <TableRow key={tx.p2p_tx_id}>
                          <TableCell>
                            <p className="text-xs font-mono text-muted-foreground">#{tx.p2p_tx_id}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold">{tx.token_symbol}</p>
                          </TableCell>
                          <TableCell>
                            <p>{formatNumber(parseFloat(tx.amount))}</p>
                          </TableCell>
                          <TableCell>
                            <p>{formatCurrency(parseFloat(tx.price))}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold">{formatCurrency(parseFloat(tx.total))}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{tx.buyer_username}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{tx.seller_username}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

