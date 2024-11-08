import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function generateNFSePDF(nfseData: any) {
  const pdf = new jsPDF();
  
  // Configurações de fonte e cores
  const titleColor = [41, 49, 51];
  const headerColor = [82, 86, 89];
  
  // Título
  pdf.setFontSize(16);
  pdf.setTextColor(...titleColor);
  pdf.text('Nota Fiscal de Serviços Eletrônica - NFSe', 14, 20);

  // Informações básicas da nota
  pdf.setFontSize(10);
  pdf.setTextColor(...headerColor);
  
  const basicInfo = [
    ['Número da Nota:', nfseData.Numero],
    ['Código de Verificação:', nfseData.CodigoVerificacao],
    ['Data de Emissão:', format(new Date(nfseData.DataEmissao), 'dd/MM/yyyy')],
    ['Competência:', format(new Date(nfseData.Competencia), 'MMMM/yyyy', { locale: ptBR })]
  ];

  autoTable(pdf, {
    startY: 30,
    head: [],
    body: basicInfo,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 }
    }
  });

  // Informações do Prestador
  pdf.setFontSize(12);
  pdf.setTextColor(...titleColor);
  pdf.text('Prestador de Serviços', 14, pdf.lastAutoTable.finalY + 10);

  const prestadorInfo = [
    ['Razão Social:', nfseData.PrestadorServico?.RazaoSocial || ''],
    ['CNPJ:', formatCNPJ(nfseData.PrestadorServico?.IdentificacaoPrestador?.Cnpj) || ''],
    ['Inscrição Municipal:', nfseData.PrestadorServico?.IdentificacaoPrestador?.InscricaoMunicipal || ''],
    ['Endereço:', formatEndereco(nfseData.PrestadorServico?.Endereco)]
  ];

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 15,
    head: [],
    body: prestadorInfo,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 }
    }
  });

  // Informações do Tomador
  pdf.setFontSize(12);
  pdf.setTextColor(...titleColor);
  pdf.text('Tomador de Serviços', 14, pdf.lastAutoTable.finalY + 10);

  const tomadorInfo = [
    ['Razão Social:', nfseData.TomadorServico?.RazaoSocial || ''],
    ['CNPJ:', formatCNPJ(nfseData.TomadorServico?.IdentificacaoTomador?.CpfCnpj?.Cnpj) || ''],
    ['Endereço:', formatEndereco(nfseData.TomadorServico?.Endereco)]
  ];

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 15,
    head: [],
    body: tomadorInfo,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 }
    }
  });

  // Discriminação dos serviços
  pdf.setFontSize(12);
  pdf.setTextColor(...titleColor);
  pdf.text('Discriminação dos Serviços', 14, pdf.lastAutoTable.finalY + 10);

  const servicos = [[nfseData.Servico?.Discriminacao || '']];

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 15,
    head: [],
    body: servicos,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4,
      cellWidth: 180
    }
  });

  // Valores
  pdf.setFontSize(12);
  pdf.setTextColor(...titleColor);
  pdf.text('Valores', 14, pdf.lastAutoTable.finalY + 10);

  const valores = [
    ['Valor dos Serviços:', formatCurrency(nfseData.Servico?.Valores?.ValorServicos)],
    ['Valor de Deduções:', formatCurrency(nfseData.Servico?.Valores?.ValorDeducoes)],
    ['Base de Cálculo:', formatCurrency(nfseData.Servico?.Valores?.BaseCalculo)],
    ['Alíquota:', `${formatAliquota(nfseData.Servico?.Valores?.Aliquota)}%`],
    ['ISS Retido:', nfseData.Servico?.Valores?.IssRetido === '1' ? 'Sim' : 'Não'],
    ['Valor do ISS:', formatCurrency(nfseData.Servico?.Valores?.ValorIss)],
    ['Valor Líquido:', formatCurrency(nfseData.Servico?.Valores?.ValorLiquidoNfse)]
  ];

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 15,
    head: [],
    body: valores,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 }
    }
  });

  // Salvar o PDF
  const fileName = `nfse-${nfseData.Numero}.pdf`;
  pdf.save(fileName);
}

// Funções auxiliares
function formatEndereco(endereco: any): string {
  if (!endereco) return '';
  
  const parts = [
    endereco.Endereco,
    endereco.Numero,
    endereco.Complemento,
    endereco.Bairro,
    endereco.Cidade,
    endereco.Uf,
    formatCEP(endereco.Cep)
  ].filter(Boolean);
  
  return parts.join(', ');
}

function formatCurrency(value: string | number | undefined): string {
  if (!value) return 'R$ 0,00';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number);
}

function formatCNPJ(cnpj: string | undefined): string {
  if (!cnpj) return '';
  
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '');
  
  // Aplica a máscara do CNPJ: 00.000.000/0000-00
  return numbers.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

function formatCEP(cep: string | undefined): string {
  if (!cep) return '';
  
  // Remove caracteres não numéricos
  const numbers = cep.replace(/\D/g, '');
  
  // Aplica a máscara do CEP: 00000-000
  return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

function formatAliquota(aliquota: string | number | undefined): string {
  if (!aliquota) return '0,00';
  
  const number = typeof aliquota === 'string' ? parseFloat(aliquota) : aliquota;
  
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}