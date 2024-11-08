import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const router = Router();
const prisma = new PrismaClient();

router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { month, year } = req.query;

    if (!clientId || !month || !year) {
      return res.status(400).json({ message: 'Cliente, mês e ano são obrigatórios' });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const client = await prisma.client.findUnique({
      where: { id_cliente: Number(clientId) }
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const supports = await prisma.support.findMany({
      where: {
        id_cliente: Number(clientId),
        data_suporte: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        cliente: true,
        status: true,
        prioridade: true,
        solicitante_demanda: true
      },
      orderBy: {
        data_suporte: 'asc'
      }
    });

    res.json({ supports, client });
  } catch (error) {
    console.error('Erro ao gerar relatório por cliente:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório por cliente' });
  }
});

router.get('/hours-control', async (req, res) => {
  try {
    const { year, clientId } = req.query;
    
    if (!year || !clientId) {
      return res.status(400).json({ message: 'Ano e cliente são obrigatórios' });
    }

    const client = await prisma.client.findUnique({
      where: { id_cliente: Number(clientId) }
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const horasContratadas = parseFloat(client.total_horas_contratadas) || 0;
    let saldoAcumulado = 0;
    const monthsData = [];

    // Buscar todos os atendimentos do ano
    const yearSupports = await prisma.support.findMany({
      where: {
        id_cliente: Number(clientId),
        data_suporte: {
          gte: new Date(Number(year), 0, 1),
          lte: new Date(Number(year), 11, 31, 23, 59, 59)
        }
      },
      orderBy: {
        data_suporte: 'asc'
      }
    });

    // Agrupar atendimentos por mês
    const monthlySupports = yearSupports.reduce((acc: any, support) => {
      const month = new Date(support.data_suporte).getMonth() + 1;
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(support);
      return acc;
    }, {});

    // Processar apenas os meses que têm atendimentos
    Object.entries(monthlySupports).forEach(([month, supports]: [string, any]) => {
      const horasUtilizadas = supports.reduce((total: number, support: any) => {
        const horas = parseFloat(support.duracao.replace('h', '')) || 0;
        return total + horas;
      }, 0);

      const saldoMes = horasContratadas - horasUtilizadas;
      saldoAcumulado += saldoMes;

      monthsData.push({
        mes: parseInt(month),
        horasContratadas: horasContratadas.toFixed(2),
        horasUtilizadas: horasUtilizadas.toFixed(2),
        saldoMes: saldoMes.toFixed(2),
        saldoAcumulado: saldoAcumulado.toFixed(2),
        quantidadeAtendimentos: supports.length
      });
    });

    // Ordenar os meses
    monthsData.sort((a, b) => a.mes - b.mes);

    const totalHorasContratadas = horasContratadas * monthsData.length;
    const totalHorasUtilizadas = monthsData.reduce((total, mes) => total + parseFloat(mes.horasUtilizadas), 0);
    const totalAtendimentos = monthsData.reduce((total, mes) => total + mes.quantidadeAtendimentos, 0);
    const saldoTotal = totalHorasContratadas - totalHorasUtilizadas;

    res.json({
      cliente: client.nome_cliente,
      meses: monthsData,
      totais: {
        horasContratadas: totalHorasContratadas.toFixed(2),
        horasUtilizadas: totalHorasUtilizadas.toFixed(2),
        saldo: saldoTotal.toFixed(2),
        quantidadeAtendimentos: totalAtendimentos
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de controle de horas:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório de controle de horas' });
  }
});

export { router as reportsRouter };