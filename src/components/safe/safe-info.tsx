"use client"

import { useEffect, useState } from "react"


import { useAccount } from "wagmi"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { CreateSafeDialog } from "./create-safe-dialog"

export function SafeInfo() {
  const { address } = useAccount()
  const [safes, setSafes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchSafes = async () => {
    if (!address) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/safes?owner=${address}`)
      if (!response.ok) {
        throw new Error("Failed to fetch safes")
      }
      const data = await response.json()
      setSafes(data.data.safes)
    } catch (e) {
      setError(e as Error)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSafes()
  }, [address])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Safe Smart Accounts</CardTitle>
          <CardDescription>
            Your Safe accounts associated with the connected wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading Safes...</p>}
          {error && <p className="text-destructive">Error: {error.message}</p>}
          {!loading && !error && (
            <>
              {safes.length > 0 ? (
                <ul className="space-y-2">
                  {safes.map((safe) => (
                    <li key={safe} className="font-mono text-sm">
                      {safe}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center">
                  <p className="mb-4">No Safe accounts found for this wallet.</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    Create Organization
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <CreateSafeDialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSafeCreated={fetchSafes}
      />
    </>
  )
}
