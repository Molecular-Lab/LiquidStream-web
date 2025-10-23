import { useState } from "react"
import EthersAdapter from "@safe-global/safe-ethers-lib"
import { SafeFactory } from "@safe-global/protocol-kit"
import { ethers } from "ethers"
import { useAccount, useConnectorClient, type WalletClient } from "wagmi"
import { type HttpTransport } from "viem"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateSafeDialogProps {
  open: boolean
  onClose: () => void
  onSafeCreated: () => void
}

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new ethers.BrowserProvider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

export function CreateSafeDialog({ open, onClose, onSafeCreated }: CreateSafeDialogProps) {
  const { address } = useAccount()
  const { data: client } = useConnectorClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateSafe = async () => {
    if (!address || !client) return

    setLoading(true)
    setError(null)

    try {
      const signer = walletClientToSigner(client)

      const safeFactory = await SafeFactory.init({ provider: signer.provider, signer })

      const safeAccountConfig = {
        owners: [address],
        threshold: 1,
      }

      const safe = await safeFactory.deploySafe({ safeAccountConfig })
      const newSafeAddress = await safe.getAddress()

      alert(`New Safe created at: ${newSafeAddress}`)
      onSafeCreated()
      onClose()
    } catch (e) {
      setError("Failed to create Safe.")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Create a new Safe account for your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p>This will create a new Safe account with you as the owner.</p>
          {error && <p className="text-destructive mt-4">Error: {error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreateSafe} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
