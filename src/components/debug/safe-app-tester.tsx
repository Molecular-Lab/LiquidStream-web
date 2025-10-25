"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, AlertTriangle, CheckCircle } from "lucide-react"
import { useSafeAppsInfo } from "@/hooks/use-safe-apps-sdk"

export function SafeAppTester() {
    const [testResult, setTestResult] = useState<string>("")
    const { mutate: testSafeConnection, isPending } = useSafeAppsInfo()

    // Check if we're in Safe context
    const isInSafeContext = () => {
        try {
            return window.parent !== window && window.parent.location.hostname.includes('safe.global')
        } catch (e) {
            return window.parent !== window
        }
    }

    const inSafe = isInSafeContext()
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

    const handleTestConnection = () => {
        testSafeConnection(undefined, {
            onSuccess: (result) => {
                setTestResult(`✅ Connected to Safe: ${result.safeInfo.safeAddress}`)
            },
            onError: (error) => {
                setTestResult(`❌ Connection failed: ${error.message}`)
            }
        })
    }

    return (
        <Card className="border-2 border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🧪 Safe Apps SDK Tester
                    {inSafe ? (
                        <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            In Safe Context
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Not in Safe
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Test Safe Apps SDK integration and connection status
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="text-sm">
                        <strong>Current Context:</strong>
                    </div>
                    <div className="text-xs font-mono bg-muted p-2 rounded">
                        URL: {currentUrl}
                    </div>
                    <div className="text-xs font-mono bg-muted p-2 rounded">
                        In Safe iframe: {inSafe ? '✅ Yes' : '❌ No'}
                    </div>
                    <div className="text-xs font-mono bg-muted p-2 rounded">
                        Parent window: {typeof window !== 'undefined' && window.parent !== window ? 'Different (iframe)' : 'Same (direct access)'}
                    </div>
                </div>

                {!inSafe && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="font-semibold text-orange-800 mb-2">
                            🔧 How to test in Safe:
                        </div>
                        <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                            <li>Go to <strong>app.safe.global</strong></li>
                            <li>Connect your wallet and access your Safe</li>
                            <li>Navigate to <strong>Apps</strong> section</li>
                            <li>Click <strong>&quot;Add Custom App&quot;</strong></li>
                            <li>Enter: <code className="bg-orange-100 px-1 rounded">http://localhost:3001</code></li>
                            <li>Open the app within Safe interface</li>
                        </ol>
                        <div className="mt-3">
                            <Button variant="outline" size="sm" asChild>
                                <a href="https://app.safe.global" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Safe App
                                </a>
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Button
                        onClick={handleTestConnection}
                        disabled={isPending}
                        variant={inSafe ? "default" : "secondary"}
                        className="w-full"
                    >
                        {isPending ? "Testing..." : "Test Safe Connection"}
                    </Button>

                    {testResult && (
                        <div className="text-sm font-mono bg-muted p-2 rounded">
                            {testResult}
                        </div>
                    )}
                </div>

                <div className="text-xs text-muted-foreground border-t pt-3">
                    <p><strong>Safe Apps SDK Status:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>SDK Initialized: ✅</li>
                        <li>iframe Context: {inSafe ? '✅' : '❌'}</li>
                        <li>Transaction Creation: {inSafe ? '✅ Ready' : '❌ Requires Safe context'}</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}