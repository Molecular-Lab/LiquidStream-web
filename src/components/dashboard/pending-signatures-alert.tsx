import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PendingSignaturesAlertProps {
  pendingCount: number
  safeAddress?: string
}

export function PendingSignaturesAlert({ pendingCount, safeAddress }: PendingSignaturesAlertProps) {
  if (pendingCount === 0) return null

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <div className="font-medium text-orange-800 dark:text-orange-200">
                {pendingCount} Pending Transaction{pendingCount > 1 ? 's' : ''} 
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Your Safe multisig has transactions waiting for signatures.
              </div>
            </div>
          </div>
          <Link href="/workspace/signatures">
            <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
              <Bell className="mr-2 h-4 w-4" />
              Review Signatures
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}