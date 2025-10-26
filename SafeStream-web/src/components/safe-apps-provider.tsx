"use client"

import { useEffect } from "react"
import SafeAppsSDK from "@safe-global/safe-apps-sdk"

const sdk = new SafeAppsSDK({
    allowedDomains: [/app\.safe\.global$/, /safe\.global$/],
    debug: true,
})

export function SafeAppsProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initialize Safe Apps SDK when component mounts
        const initSafeAppsSDK = async () => {
            try {
                // Check if we're in a Safe iframe context
                const isInSafeContext = window.parent !== window

                if (isInSafeContext) {
                    console.log("🔄 Initializing Safe Apps SDK...")

                    // Get Safe info to confirm connection
                    const safeInfo = await sdk.safe.getInfo()
                    console.log("✅ Safe Apps SDK initialized successfully:", safeInfo)

                        // Store Safe info in window for debugging
                        ; (window as any).__SAFE_CONTEXT__ = {
                            safeAddress: safeInfo.safeAddress,
                            chainId: safeInfo.chainId,
                            threshold: safeInfo.threshold,
                            owners: safeInfo.owners,
                            isReadOnly: safeInfo.isReadOnly,
                        }
                } else {
                    console.log("ℹ️ Not running in Safe context - Safe Apps SDK available for manual testing")
                }
            } catch (error) {
                console.error("❌ Failed to initialize Safe Apps SDK:", error)
            }
        }

        // Small delay to ensure DOM is ready
        const timer = setTimeout(initSafeAppsSDK, 100)
        return () => clearTimeout(timer)
    }, [])

    return <>{children}</>
}