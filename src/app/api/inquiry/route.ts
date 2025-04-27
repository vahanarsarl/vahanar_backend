import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const inquirySchema = z.object({
  userName: z.string().min(1),
  phone: z.string().min(1),
  message: z.string().min(1),
  vehicleId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userName, phone, message, vehicleId } = inquirySchema.parse(body)

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userName,
        phone,
        message,
        vehicleId,
      },
    })

    return NextResponse.json(inquiry)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 