import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome_cliente, dia_fechamento, gestor, total_horas_contratadas } = req.body;
    const client = await prisma.client.create({
      data: { nome_cliente, dia_fechamento, gestor, total_horas_contratadas }
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar cliente' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_cliente, dia_fechamento, gestor, total_horas_contratadas } = req.body;
    const client = await prisma.client.update({
      where: { id_cliente: Number(id) },
      data: { nome_cliente, dia_fechamento, gestor, total_horas_contratadas }
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({
      where: { id_cliente: Number(id) }
    });
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover cliente' });
  }
});

export const clientsRouter = router;