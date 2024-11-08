import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Buscar todos os solicitantes
router.get('/', async (req, res) => {
  try {
    const solicitantes = await prisma.solicitanteDemanda.findMany({
      include: {
        cliente: true
      }
    });
    res.json(solicitantes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar solicitantes' });
  }
});

// Buscar solicitantes por cliente
router.get('/cliente/:id_cliente', async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const solicitantes = await prisma.solicitanteDemanda.findMany({
      where: {
        id_cliente: parseInt(id_cliente)
      }
    });
    res.json(solicitantes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar solicitantes do cliente' });
  }
});

// Criar novo solicitante
router.post('/', async (req, res) => {
  try {
    const { id_cliente, nome_solicitante_demanda } = req.body;
    const solicitante = await prisma.solicitanteDemanda.create({
      data: {
        id_cliente: parseInt(id_cliente),
        nome_solicitante_demanda
      },
      include: {
        cliente: true
      }
    });
    res.json(solicitante);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar solicitante' });
  }
});

export const solicitantesRouter = router;