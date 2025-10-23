import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const owner = searchParams.get("owner")

  if (!owner) {
    return new Response("Owner address is required", { status: 400 })
  }

  try {
    const res = await fetch(
      `https://safe-transaction-sepolia.safe.global/api/v1/owners/${owner}/safes/`,
    )
    const data = await res.json()

    return Response.json({ data })
  } catch (error) {
    return new Response("Error fetching data from Safe API", { status: 500 })
  }
}