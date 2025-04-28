import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/vehicles/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { brand: { contains: query as string, mode: 'insensitive' } },
          { model: { contains: query as string, mode: 'insensitive' } },
        ],
      },
    });
    return res.json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/vehicle/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/locations', async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany();
    return res.json(locations);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/inquiry', async (req: Request, res: Response) => {
  try {
    const inquirySchema = z.object({
      userName: z.string(),
      phone: z.string(),
      message: z.string(),
      vehicleId: z.string(),
    });

    const validatedData = inquirySchema.parse(req.body);
    const inquiry = await prisma.inquiry.create({
      data: validatedData,
    });
    return res.json(inquiry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 