import usersData from "./users.json"
import walletsData from "./wallets.json"
import tokensData from "./tokens.json"
import transactionsData from "./transactions.json"
import blocksData from "./blocks.json"
import validatorsData from "./validators.json"

import type { AppUser, Wallet, Token, Transaction, Block, Validator } from "@/types/blockchain"

export const users: AppUser[] = usersData
export const wallets: Wallet[] = walletsData
export const tokens: Token[] = tokensData
export const transactions: Transaction[] = transactionsData
export const blocks: Block[] = blocksData
export const validators: Validator[] = validatorsData

