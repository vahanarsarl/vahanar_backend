import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { brand: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 