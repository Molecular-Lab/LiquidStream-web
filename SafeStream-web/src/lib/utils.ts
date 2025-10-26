import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { fromHex, toHex } from "viem"
import { generatePrivateKey } from "viem/accounts"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}