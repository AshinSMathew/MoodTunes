import { NextResponse } from 'next/server'
import { getAuthCookies } from '@/lib/auth'

export async function GET() {
  try {
    const { accessToken } = await getAuthCookies()
    return NextResponse.json({
      authenticated: !!accessToken
    })
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}