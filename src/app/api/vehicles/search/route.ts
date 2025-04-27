import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const searchSchema = z.object({
  locationId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { locationId, startDate, endDate } = searchSchema.parse(body)

    // First, get all vehicles at this location
    const allVehicles = await prisma.vehicle.findMany({
      where: {
        locationId,
      },
      include: {
        location: {
          select: {
            city: true,
            address: true,
          },
        },
      },
    })

    // Then filter by availability
    const availableVehicles = allVehicles.filter(vehicle => {
      const vehicleStart = new Date(vehicle.availableFrom)
      const vehicleEnd = new Date(vehicle.availableTo)
      const searchStart = new Date(startDate)
      const searchEnd = new Date(endDate)

      return vehicleStart <= searchStart && vehicleEnd >= searchEnd
    })

    // Return both available and unavailable vehicles with reason
    const response = {
      available: availableVehicles,
      unavailable: allVehicles
        .filter(v => !availableVehicles.includes(v))
        .map(v => ({
          ...v,
          reason: new Date(v.availableFrom) > new Date(startDate) 
            ? 'Not available until ' + v.availableFrom 
            : 'Not available after ' + v.availableTo
        }))
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error searching vehicles:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 