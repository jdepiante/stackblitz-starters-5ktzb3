import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Definição das cores padrão
const colors = {
  header: [178, 200, 171], // Verde camomila acetinado
  text: [64, 64, 64], // Cinza escuro para texto
  lightGray: [245, 245, 245], // Cinza claro para alternância de linhas
  positive: [121, 159, 109], // Verde camomila mais escuro para valores positivos
  negative: [159, 109, 109], // Vermelho suave para valores negativos
  neutral: [128, 128, 128] // Cinza médio para valores neutros
};

// Função para adicionar o logo
function addLogo(pdf: jsPDF, x: number, y: number) {
  pdf.setDrawColor(...colors.text);
  pdf.setFillColor(...colors.header);
  
  // Base do banco de dados
  pdf.ellipse(x + 10, y + 15, 8, 3, 'F');
  
  // Camadas do banco de dados
  pdf.ellipse(x + 10, y + 10, 8, 3, 'F');
  pdf.ellipse(x + 10, y + 5, 8, 3, 'F');
  
  // Linhas de conexão
  pdf.line(x + 2, y + 5, x + 2, y + 15);
  pdf.line(x + 18, y + 5, x + 18, y + 15);
  
  // Símbolo de suporte
  pdf.circle(x + 10, y + 10, 2, 'S');
  pdf.line(x + 8, y + 10, x + 12, y + 10);
  pdf.line(x + 10, y + 8, x + 10, y + 12);
}

export function generateClientReport(data: any, selectedMonth: string, selectedYear: string) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [330, 216] // Formato ofício em paisagem (330mm x 216mm)
  });
  
  const { supports, client } = data;
  const margin = 5; // Margem de 0.5cm = 5mm
  const pageWidth = 330;

  // Adiciona o logo
  addLogo(pdf, margin, margin);

  // Título
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(...colors.text);
  const title = `RELATÓRIO DE ATENDIMENTOS - ${client.nome_cliente}`;
  const titleWidth = pdf.getStringUnitWidth(title) * 14 / pdf.internal.scaleFactor;
  const titleX = (pageWidth - titleWidth) / 2;
  pdf.text(title, titleX, margin + 5);

  // Cabeçalho em formato de tabela com 4 colunas
  const headerData = [
    ['Cliente:', client.nome_cliente, 'Período:', format(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1), 'MMMM/yyyy', { locale: ptBR })],
    ['Gestor:', client.gestor, 'Dia Fechamento:', `${client.dia_fechamento}`],
    ['Total Horas Contratadas:', client.total_horas_contratadas, '', '']
  ];

  autoTable(pdf, {
    body: headerData,
    startY: margin + 15,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2,
      textColor: colors.text,
      minCellHeight: 0.5,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' }, // Descrição 1
      1: { cellWidth: 120 },                   // Valor 1
      2: { cellWidth: 40, fontStyle: 'bold' }, // Descrição 2
      3: { cellWidth: 120 }                    // Valor 2
    }
  });

  const tableHeaders = [
    'Data',
    'Primeiro Contato',
    'Início Suporte',
    'Fim Suporte',
    'Status',
    'Prioridade',
    'Solicitante',
    'Tarefa',
    'Descrição',
    'Duração'
  ];

  const tableData = supports.map((support: any) => [
    format(new Date(support.data_suporte), 'dd/MM/yyyy'),
    format(new Date(support.primeiro_contato), 'dd/MM/yyyy HH:mm'),
    format(new Date(support.inicio_suporte), 'HH:mm'),
    format(new Date(support.fim_suporte), 'HH:mm'),
    support.status.status,
    support.prioridade.prioridade,
    support.solicitante_demanda.nome_solicitante_demanda,
    support.nome_tarefa,
    support.descricao_suporte,
    support.duracao
  ]);

  // Calcular total de horas
  const totalHoras = supports.reduce((acc: number, support: any) => {
    const horas = parseFloat(support.duracao.replace('h', '')) || 0;
    return acc + horas;
  }, 0);

  // Adicionar linha de total
  tableData.push([
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `${totalHoras.toFixed(2)}h`
  ]);

  autoTable(pdf, {
    head: [tableHeaders],
    body: tableData,
    startY: pdf.lastAutoTable.finalY + 10,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: colors.text,
      minCellHeight: 0.5
    },
    headStyles: {
      fillColor: colors.header,
      textColor: colors.text,
      fontSize: 8,
      fontStyle: 'bold',
      minCellHeight: 0.6
    },
    alternateRowStyles: {
      fillColor: colors.lightGray
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Data
      1: { cellWidth: 30 }, // Primeiro Contato
      2: { cellWidth: 20 }, // Início Suporte
      3: { cellWidth: 20 }, // Fim Suporte
      4: { cellWidth: 20 }, // Status
      5: { cellWidth: 20 }, // Prioridade
      6: { cellWidth: 30 }, // Solicitante
      7: { cellWidth: 35 }, // Tarefa
      8: { cellWidth: 'auto' }, // Descrição
      9: { cellWidth: 20 }  // Duração
    },
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = colors.lightGray;
      }
    }
  });

  pdf.save(`relatorio-${client.nome_cliente.toLowerCase().replace(/\s+/g, '-')}-${selectedMonth}-${selectedYear}.pdf`);
}

export function generateHoursControlReport(data: any, selectedYear: string) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const { cliente, meses, totais } = data;
  const margin = 10;

  // Adiciona o logo
  addLogo(pdf, margin, margin);

  // Título
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(...colors.text);
  const title = `CONTROLE DE HORAS SUPORTE DBA - ${cliente}`;
  const titleWidth = pdf.getStringUnitWidth(title) * 14 / pdf.internal.scaleFactor;
  const titleX = (pdf.internal.pageSize.width - titleWidth) / 2;
  pdf.text(title, titleX, margin + 5);

  const tableHeaders = [
    'Mês',
    'Horas Contratadas',
    'Horas Utilizadas',
    'Saldo Mês',
    'Saldo Acumulado',
    'Qtd. Atendimentos'
  ];

  const tableData = meses.map((mes: any) => [
    format(new Date(parseInt(selectedYear), mes.mes - 1), 'MMM/yyyy', { locale: ptBR }),
    mes.horasContratadas,
    mes.horasUtilizadas,
    mes.saldoMes,
    mes.saldoAcumulado,
    mes.quantidadeAtendimentos
  ]);

  // Adicionar linha de total
  tableData.push([
    'TOTAL',
    totais.horasContratadas,
    totais.horasUtilizadas,
    totais.saldo,
    '',
    totais.quantidadeAtendimentos
  ]);

  autoTable(pdf, {
    head: [tableHeaders],
    body: tableData,
    startY: margin + 20,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: colors.text,
      minCellHeight: 0.8
    },
    headStyles: {
      fillColor: colors.header,
      textColor: colors.text,
      fontSize: 9,
      fontStyle: 'bold',
      minCellHeight: 0.8
    },
    alternateRowStyles: {
      fillColor: colors.lightGray
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Mês
      1: { cellWidth: 30 }, // Horas Contratadas
      2: { cellWidth: 30 }, // Horas Utilizadas
      3: { cellWidth: 25 }, // Saldo Mês
      4: { cellWidth: 30 }, // Saldo Acumulado
      5: { cellWidth: 30 }  // Quantidade de Atendimentos
    },
    didParseCell: function(data) {
      // Última linha (totais)
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = colors.lightGray;
      }
      
      // Colunas de saldo (índices 3 e 4)
      if ((data.column.index === 3 || data.column.index === 4) && data.row.index < tableData.length - 1) {
        const value = parseFloat(data.cell.text);
        if (value > 0) {
          data.cell.styles.textColor = colors.positive;
        } else if (value < 0) {
          data.cell.styles.textColor = colors.negative;
        } else {
          data.cell.styles.textColor = colors.neutral;
        }
      }
    }
  });

  pdf.save(`controle-horas-${cliente.toLowerCase().replace(/\s+/g, '-')}-${selectedYear}.pdf`);
}