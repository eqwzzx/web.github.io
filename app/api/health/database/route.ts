import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    // Simple query to test connection
    const result = await sql`SELECT 1 as test`

    if (result && result.length > 0) {
      return NextResponse.json({
        connected: true,
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          connected: false,
          error: "No response from database",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}