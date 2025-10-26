import { env } from "@/env.mjs"

export const siteConfig = {
  name: "SafeStream",
  author: "---",
  description: "Enterprise payroll stablecoin streaming provider platform. Revolutionizes the payroll systems.",
  keywords: [],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "Author",
  },
  twitter: "",
  favicon: "/favicon.ico",
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
