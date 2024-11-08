import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const prioridades = await prisma.prioridade.findMany();
    res.json(prioridades);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar prioridades' });
  }
});

export const prioridadesRouter = router;