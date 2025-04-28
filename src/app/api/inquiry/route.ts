import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const inquirySchema = z.object({
  userName: z.string(),
  phone: z.string(),
  message: z.string(),
  vehicleId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = inquirySchema.parse(body);

    const inquiry = await prisma.inquiry.create({
      data: validatedData,
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 