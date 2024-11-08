import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const status = await prisma.status.findMany();
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar status' });
  }
});

export const statusRouter = router;