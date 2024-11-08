import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { clientId, month, year } = req.query;
    
    let whereClause: any = {};
    
    if (clientId) {
      whereClause.id_cliente = parseInt(clientId as string);
    }
    
    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      
      whereClause.data_suporte = {
        gte: startDate,
        lte: endDate
      };
    }

    const supports = await prisma.support.findMany({
      where: whereClause,
      include: {
        cliente: true,
        status: true,
        prioridade: true,
        solicitante_demanda: true
      },
      orderBy: {
        data_suporte: 'desc'
      }
    });
    res.json(supports);
  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error);
    res.status(500).json({ message: 'Erro ao buscar atendimentos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      id_cliente,
      id_status,
      id_prioridade,
      id_solicitante_demanda,
      primeiro_contato,
      inicio_suporte,
      fim_suporte,
      nome_tarefa,
      descricao_suporte
    } = req.body;

    // Validações básicas
    if (!id_cliente || !id_status || !id_prioridade || !id_solicitante_demanda || 
        !inicio_suporte || !fim_suporte || !nome_tarefa || !descricao_suporte) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Converte as strings de data para objetos Date
    const inicio = new Date(inicio_suporte);
    const fim = new Date(fim_suporte);

    // Validação das datas
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      return res.status(400).json({ message: 'Datas inválidas' });
    }

    if (fim < inicio) {
      return res.status(400).json({ message: 'A data de fim deve ser posterior à data de início' });
    }
    
    // Calcula a duração em horas
    const duracaoMs = fim.getTime() - inicio.getTime();
    const duracaoHoras = Math.round((duracaoMs / (1000 * 60 * 60)) * 100) / 100;
    const duracao = `${duracaoHoras}h`;

    // Prepara os dados para o Prisma
    const data: any = {
      id_cliente: parseInt(id_cliente),
      id_status: parseInt(id_status),
      id_prioridade: parseInt(id_prioridade),
      id_solicitante_demanda: parseInt(id_solicitante_demanda),
      inicio_suporte: inicio,
      fim_suporte: fim,
      data_suporte: inicio,
      duracao,
      nome_tarefa,
      descricao_suporte
    };

    // Adiciona primeiro_contato apenas se fornecido
    if (primeiro_contato) {
      const primeiroContatoDate = new Date(primeiro_contato);
      if (!isNaN(primeiroContatoDate.getTime())) {
        data.primeiro_contato = primeiroContatoDate;
      }
    }

    const support = await prisma.support.create({
      data,
      include: {
        cliente: true,
        status: true,
        prioridade: true,
        solicitante_demanda: true
      }
    });
    res.json(support);
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    res.status(500).json({ message: 'Erro ao criar atendimento' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_status,
      id_prioridade,
      primeiro_contato,
      inicio_suporte,
      fim_suporte,
      nome_tarefa,
      descricao_suporte
    } = req.body;

    // Validações básicas
    if (!id_status || !id_prioridade || !inicio_suporte || 
        !fim_suporte || !nome_tarefa || !descricao_suporte) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Converte as strings de data para objetos Date
    const inicio = new Date(inicio_suporte);
    const fim = new Date(fim_suporte);

    // Validação das datas
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      return res.status(400).json({ message: 'Datas inválidas' });
    }

    if (fim < inicio) {
      return res.status(400).json({ message: 'A data de fim deve ser posterior à data de início' });
    }
    
    // Calcula a duração em horas
    const duracaoMs = fim.getTime() - inicio.getTime();
    const duracaoHoras = Math.round((duracaoMs / (1000 * 60 * 60)) * 100) / 100;
    const duracao = `${duracaoHoras}h`;

    // Prepara os dados para o Prisma
    const data: any = {
      id_status: parseInt(id_status),
      id_prioridade: parseInt(id_prioridade),
      inicio_suporte: inicio,
      fim_suporte: fim,
      data_suporte: inicio,
      duracao,
      nome_tarefa,
      descricao_suporte
    };

    // Adiciona primeiro_contato apenas se fornecido
    if (primeiro_contato) {
      const primeiroContatoDate = new Date(primeiro_contato);
      if (!isNaN(primeiroContatoDate.getTime())) {
        data.primeiro_contato = primeiroContatoDate;
      }
    }

    const support = await prisma.support.update({
      where: { id_suporte: Number(id) },
      data,
      include: {
        cliente: true,
        status: true,
        prioridade: true,
        solicitante_demanda: true
      }
    });
    res.json(support);
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error);
    res.status(500).json({ message: 'Erro ao atualizar atendimento' });
  }
});

export { router as supportsRouter };