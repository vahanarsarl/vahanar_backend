import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        city: true,
        address: true,
      },
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    
    // Check if it's a Prisma error
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Database error',
          message: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 