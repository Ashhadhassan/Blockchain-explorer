"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"

import { users as seedUsers, tokens as seedTokens } from "@/data"
import { blocksApi, walletsApi, tokensApi, transactionsApi, usersApi } from "@/lib/api"
import type {
  AppUser,
  Block,
  CreateTokenInput,
  CreateTransactionInput,
  CreateUserInput,
  CreateWalletInput,
  Token,
  Transaction,
  Validator,
  Wallet,
} from "@/types/blockchain"

type ThemeMode = "light" | "dark"

interface AppStoreState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  hasHydrated: boolean
  markHydrated: () => void

  currentUser: AppUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  addUser: (payload: CreateUserInput) => AppUser

  users: AppUser[]
  wallets: Wallet[]
  tokens: Token[]
  transactions: Transaction[]
  blocks: Block[]
  validators: Validator[]

  isLoading: {
    blocks: boolean
    wallets: boolean
    tokens: boolean
    transactions: boolean
  }

  // API Actions
  fetchBlocks: () => Promise<void>
  fetchWallets: (userId?: string) => Promise<void>
  fetchTokens: () => Promise<void>
  fetchTransactions: () => Promise<void>
  
  // Wallet actions
  addWallet: (payload: CreateWalletInput) => Promise<Wallet>
  sendTransaction: (data: {
    fromAddress: string
    toAddress: string
    tokenSymbol: string
    amount: number
    method?: string
  }) => Promise<Transaction | null>

  // Local actions (for backward compatibility)
  addToken: (payload: CreateTokenInput) => Token
  addTransaction: (payload: CreateTransactionInput) => Transaction
  addTransactions: (payloads: CreateTransactionInput[]) => Transaction[]

  // P2P Settings
  p2pEnabled: boolean
  setP2pEnabled: (enabled: boolean) => void
}

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(16).slice(2, 8)}`

const randomHex = (length: number) => {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
  return uuid.replace(/-/g, "").padEnd(length, "0").slice(0, length)
}

const generateHash = () => `0x${randomHex(64)}`

const generateAddress = () => `0x${randomHex(40)}`

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      hasHydrated: false,
      markHydrated: () => set({ hasHydrated: true }),

      currentUser: null,
      login: async (email, password) => {
        try {
          const user = await usersApi.login(email, password)
          // Allow login even if email not verified, but show warning
          // Store the numeric user ID properly
          const numericUserId = user.userId || user.id;
          const appUser: AppUser = {
            id: numericUserId.toString(), // Store as string but ensure it's numeric
            name: user.fullName || user.username,
            email: user.email,
            password: "", // Don't store password
            role: "user" as const, // All users are regular users, no admin
            title: "User",
            organization: "BlockChain Explorer",
            status: user.status === "active" ? "active" : "suspended",
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            avatar: "/placeholder-user.jpg",
          }
          set({ currentUser: appUser })
          // Fetch user's data after login
          await get().fetchWallets(numericUserId.toString())
          // Also fetch tokens
          await get().fetchTokens()
          return { success: true, emailVerified: user.emailVerified }
        } catch (error: any) {
          const message = error.data?.message || error.message || "Login failed"
          return { success: false, message }
        }
      },
      logout: () => set({ currentUser: null }),
      addUser: (payload) => {
        const newUser: AppUser = {
          id: generateId("user"),
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: payload.role ?? "user",
          title: "Research Analyst",
          organization: "BlockView Labs",
          status: "active",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          avatar: "/placeholder-user.jpg",
        }
        set((state) => ({ users: [newUser, ...state.users] }))
        return newUser
      },

      users: seedUsers,
      wallets: [],
      tokens: seedTokens, // Keep tokens local for now
      transactions: [],
      blocks: [],
      validators: [],

      isLoading: {
        blocks: false,
        wallets: false,
        tokens: false,
        transactions: false,
      },

      // API Fetch Functions
      fetchBlocks: async () => {
        set((state) => ({ isLoading: { ...state.isLoading, blocks: true } }))
        try {
          const blocks = await blocksApi.getLatest(50)
          set({ blocks })
        } catch (error) {
          console.error("Failed to fetch blocks:", error)
          toast.error("Failed to load blocks")
        } finally {
          set((state) => ({ isLoading: { ...state.isLoading, blocks: false } }))
        }
      },

      fetchWallets: async (userId?: string) => {
        set((state) => ({ isLoading: { ...state.isLoading, wallets: true } }))
        try {
          const targetUserId = userId || get().currentUser?.id
          const wallets = await walletsApi.getAll(targetUserId)
          set({ wallets })
        } catch (error) {
          console.error("Failed to fetch wallets:", error)
          toast.error("Failed to load wallets")
        } finally {
          set((state) => ({ isLoading: { ...state.isLoading, wallets: false } }))
        }
      },

      fetchTokens: async () => {
        set((state) => ({ isLoading: { ...state.isLoading, tokens: true } }))
        try {
          const tokenList = await tokensApi.getAll(100)
          set({ tokens: tokenList })
        } catch (error) {
          console.error("Failed to fetch tokens:", error)
          // Keep seed tokens as fallback
        } finally {
          set((state) => ({ isLoading: { ...state.isLoading, tokens: false } }))
        }
      },

      fetchTransactions: async () => {
        set((state) => ({ isLoading: { ...state.isLoading, transactions: true } }))
        try {
          const transactions = await transactionsApi.getAll(100)
          set({ transactions })
        } catch (error) {
          console.error("Failed to fetch transactions:", error)
          toast.error("Failed to load transactions")
        } finally {
          set((state) => ({ isLoading: { ...state.isLoading, transactions: false } }))
        }
      },

      // Wallet Actions
      addWallet: async (payload) => {
        if (!get().currentUser) {
          toast.error("Please login to create a wallet")
          throw new Error("Not authenticated")
        }

        try {
          // Get user ID from database (currentUser.id is string, need to get actual user_id)
          const userProfile = await usersApi.getProfile(get().currentUser!.id)
          const wallet = await walletsApi.create(payload.label, userProfile.user_id.toString())
          set((state) => ({ wallets: [wallet, ...state.wallets] }))
          toast.success(`Wallet ${wallet.label} created`)
          return wallet
        } catch (error) {
          console.error("Failed to create wallet:", error)
          toast.error("Failed to create wallet")
          throw error
        }
      },

      sendTransaction: async (data) => {
        try {
          const transaction = await transactionsApi.create(data)
          set((state) => ({ transactions: [transaction, ...state.transactions] }))
          
          // Refresh wallets to update balances
          await get().fetchWallets()
          
          toast.success("Transaction sent successfully")
          return transaction
        } catch (error: any) {
          console.error("Failed to send transaction:", error)
          const message = error.data?.message || "Failed to send transaction"
          toast.error(message)
          return null
        }
      },

      addToken: (payload) => {
        const newToken: Token = {
          id: generateId("token"),
          symbol: payload.symbol.toUpperCase(),
          name: payload.name,
          type: payload.type,
          priceUsd: payload.priceUsd,
          change24h: 0,
          supply: payload.supply,
          marketCapUsd: payload.priceUsd * payload.supply,
        }
        set((state) => ({ tokens: [newToken, ...state.tokens] }))
        return newToken
      },

      addTransaction: (payload) => {
        const blockId = payload.blockId ?? get().blocks[get().blocks.length - 1]?.id ?? "pending"
        const newTransaction: Transaction = {
          id: generateId("tx"),
          hash: generateHash(),
          fromWalletId: payload.fromWalletId,
          toWalletId: payload.toWalletId,
          tokenId: payload.tokenId,
          blockId,
          amount: payload.amount,
          fee: Math.random() * 0.01,
          status: payload.status ?? "pending",
          timestamp: new Date().toISOString(),
          method: payload.method ?? "Generated",
        }

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
          blocks: state.blocks.map((block) =>
            block.id === blockId ? { ...block, transactionIds: [newTransaction.id, ...block.transactionIds] } : block,
          ),
        }))

        return newTransaction
      },

      addTransactions: (payloads) => payloads.map((payload) => get().addTransaction(payload)),

      // P2P Settings
      p2pEnabled: false,
      setP2pEnabled: (enabled) => set({ p2pEnabled: enabled }),
    }),
    {
      name: "blockview-app-store",
      onRehydrateStorage: () => (state) => {
        state?.markHydrated()
      },
      partialize: (state) => ({
        theme: state.theme,
        currentUser: state.currentUser,
        users: state.users,
        wallets: state.wallets,
        tokens: state.tokens,
        transactions: state.transactions,
        blocks: state.blocks,
        p2pEnabled: state.p2pEnabled,
      }),
    },
  ),
)

