import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parseStringPromise } from 'xml2js';
import { authenticateToken } from '../middleware/auth';
import axios from 'axios';
import https from 'https';

const router = Router();
const prisma = new PrismaClient();

// Lista todas as notas fiscais
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notas = await prisma.notaFiscal.findMany({
      orderBy: {
        data_emissao: 'desc'
      },
      include: {
        cliente: true
      }
    });
    res.json(notas);
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    res.status(500).json({ message: 'Erro ao buscar notas fiscais' });
  }
});

// Endpoint para consulta via web service
router.post('/consultar', authenticateToken, async (req, res) => {
  try {
    const { soapEnvelope, clientId } = req.body;

    if (!soapEnvelope || !clientId) {
      return res.status(400).json({ 
        message: 'Envelope SOAP e ID do cliente são obrigatórios' 
      });
    }

    // Verifica se o cliente existe
    const cliente = await prisma.client.findUnique({
      where: { id_cliente: parseInt(clientId) }
    });

    if (!cliente) {
      return res.status(404).json({ 
        message: 'Cliente não encontrado' 
      });
    }

    // Configuração do agente HTTPS para aceitar certificados auto-assinados
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    // Faz a requisição ao web service
    const response = await axios.post(
      'https://tributacao.vilavelha.es.gov.br/tbw/services/Abrasf23',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'http://nfse.abrasf.org.br/ConsultarNfse'
        },
        httpsAgent: agent
      }
    );

    // Processa a resposta do web service
    const xmlResponse = response.data;
    
    // Faz o parse do XML para extrair as notas
    const result = await parseStringPromise(xmlResponse, {
      explicitArray: false,
      ignoreAttrs: true,
      trim: true
    });

    // Processa e importa as notas encontradas
    const notasImportadas = [];
    const notasErro = [];

    const processarNotas = async (notas: any[]) => {
      for (const nota of notas) {
        try {
          const nfseData = nota.Nfse?.InfNfse;
          if (!nfseData) continue;

          // Verifica se a nota já existe
          const notaExistente = await prisma.notaFiscal.findFirst({
            where: {
              numero: nfseData.Numero,
              codigo_verificacao: nfseData.CodigoVerificacao,
              id_cliente: cliente.id_cliente
            }
          });

          if (notaExistente) {
            notasErro.push({
              numero: nfseData.Numero,
              erro: 'Nota fiscal já importada'
            });
            continue;
          }

          // Cria a nova nota fiscal
          const notaFiscal = await prisma.notaFiscal.create({
            data: {
              numero: nfseData.Numero,
              codigo_verificacao: nfseData.CodigoVerificacao,
              data_emissao: new Date(nfseData.DataEmissao),
              competencia: new Date(nfseData.Competencia),
              valor_servicos: parseFloat(nfseData.Servico.Valores.ValorServicos),
              valor_liquido: parseFloat(nfseData.Servico.Valores.ValorLiquidoNfse),
              discriminacao: nfseData.Servico.Discriminacao,
              xml_content: xmlResponse,
              id_cliente: cliente.id_cliente
            },
            include: {
              cliente: true
            }
          });

          notasImportadas.push(notaFiscal);
        } catch (error) {
          console.error('Erro ao processar nota:', error);
          notasErro.push({
            numero: nota.Nfse?.InfNfse?.Numero || 'Número não identificado',
            erro: error instanceof Error ? error.message : 'Erro ao processar a nota fiscal'
          });
        }
      }
    };

    // Processa as notas encontradas
    if (result.ConsultarNfseResposta?.ListaNfse) {
      const listaNfse = result.ConsultarNfseResposta.ListaNfse;
      if (Array.isArray(listaNfse)) {
        await processarNotas(listaNfse);
      } else if (listaNfse.CompNfse) {
        await processarNotas(
          Array.isArray(listaNfse.CompNfse) ? listaNfse.CompNfse : [listaNfse.CompNfse]
        );
      }
    }

    res.json({
      message: `${notasImportadas.length} nota(s) fiscal(is) importada(s) com sucesso${
        notasErro.length > 0 ? ` e ${notasErro.length} erro(s)` : ''
      }`,
      importadas: notasImportadas.length,
      erros: notasErro.length,
      detalhes: {
        notasImportadas,
        notasErro
      }
    });
  } catch (error) {
    console.error('Erro na consulta de NFSe:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Erro ao consultar NFSe' 
    });
  }
});

// Importação de XML
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const { xmlContent } = req.body;

    if (!xmlContent) {
      return res.status(400).json({ message: 'Conteúdo XML não fornecido' });
    }

    // Parse do XML com opções ajustadas
    let result;
    try {
      result = await parseStringPromise(xmlContent, {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true,
        normalize: true,
        explicitRoot: true,
        tagNameProcessors: [(name) => name.replace(/^(.*:)/, '')],
        valueProcessors: [(value) => value.trim()]
      });
    } catch (parseError) {
      console.error('Erro no parse do XML:', parseError);
      return res.status(400).json({ 
        message: 'Erro ao processar o XML. Verifique se o arquivo está no formato correto.',
        error: parseError instanceof Error ? parseError.message : 'Erro desconhecido'
      });
    }

    // Função auxiliar para extrair notas do XML
    const extractNfseList = (xmlObj: any) => {
      try {
        // Tenta diferentes caminhos possíveis para encontrar as notas
        if (xmlObj.ConsultarNfseResposta?.ListaNfse?.CompNfse) {
          const compNfse = xmlObj.ConsultarNfseResposta.ListaNfse.CompNfse;
          return Array.isArray(compNfse) ? compNfse : [compNfse];
        }
        
        if (xmlObj.ConsultarNfseResposta?.ListaNfse) {
          const listaNfse = xmlObj.ConsultarNfseResposta.ListaNfse;
          if (Array.isArray(listaNfse)) {
            return listaNfse.flatMap(item => 
              item.CompNfse ? (Array.isArray(item.CompNfse) ? item.CompNfse : [item.CompNfse]) : []
            );
          }
        }

        throw new Error('Estrutura do XML não reconhecida');
      } catch (error) {
        console.error('Erro ao extrair notas do XML:', error);
        throw new Error('Não foi possível encontrar as notas fiscais no XML');
      }
    };

    // Extrai a lista de notas
    const nfseList = extractNfseList(result);

    if (!nfseList || nfseList.length === 0) {
      return res.status(400).json({ 
        message: 'Nenhuma nota fiscal encontrada no XML' 
      });
    }

    const notasImportadas = [];
    const notasErro = [];

    // Processa cada nota fiscal
    for (const nfseItem of nfseList) {
      try {
        const nfseData = nfseItem.Nfse?.InfNfse;
        if (!nfseData) {
          throw new Error('Dados da nota fiscal não encontrados');
        }

        const tomadorData = nfseData.TomadorServico;
        if (!tomadorData?.IdentificacaoTomador?.CpfCnpj?.Cnpj) {
          throw new Error('CNPJ do tomador não encontrado');
        }

        const cnpjTomador = tomadorData.IdentificacaoTomador.CpfCnpj.Cnpj;

        // Busca o cliente pelo CNPJ
        const cliente = await prisma.client.findFirst({
          where: { cnpj: cnpjTomador }
        });

        if (!cliente) {
          notasErro.push({
            numero: nfseData.Numero || 'N/A',
            erro: `Cliente não encontrado com o CNPJ ${cnpjTomador}`
          });
          continue;
        }

        // Validações básicas
        if (!nfseData.Numero || !nfseData.CodigoVerificacao) {
          throw new Error('Número ou código de verificação da nota não encontrado');
        }

        // Verifica se a nota já existe
        const notaExistente = await prisma.notaFiscal.findFirst({
          where: {
            numero: nfseData.Numero,
            codigo_verificacao: nfseData.CodigoVerificacao,
            id_cliente: cliente.id_cliente
          }
        });

        if (notaExistente) {
          notasErro.push({
            numero: nfseData.Numero,
            erro: 'Nota fiscal já importada para este cliente'
          });
          continue;
        }

        // Processa os valores
        const valorServicos = parseFloat(nfseData.Servico?.Valores?.ValorServicos || '0');
        const valorLiquido = parseFloat(nfseData.Servico?.Valores?.ValorLiquidoNfse || '0');

        if (isNaN(valorServicos) || isNaN(valorLiquido)) {
          throw new Error('Valores da nota fiscal inválidos');
        }

        // Processa as datas
        const dataEmissao = new Date(nfseData.DataEmissao);
        const competencia = new Date(nfseData.Competencia);

        if (isNaN(dataEmissao.getTime()) || isNaN(competencia.getTime())) {
          throw new Error('Datas da nota fiscal inválidas');
        }

        // Cria a nota fiscal
        const notaFiscal = await prisma.notaFiscal.create({
          data: {
            numero: nfseData.Numero,
            codigo_verificacao: nfseData.CodigoVerificacao,
            data_emissao: dataEmissao,
            competencia: competencia,
            valor_servicos: valorServicos,
            valor_liquido: valorLiquido,
            discriminacao: nfseData.Servico?.Discriminacao || '',
            xml_content: xmlContent,
            id_cliente: cliente.id_cliente
          },
          include: {
            cliente: true
          }
        });

        notasImportadas.push({
          ...notaFiscal,
          xmlData: nfseData
        });
      } catch (error) {
        console.error('Erro ao processar nota fiscal:', error);
        notasErro.push({
          numero: nfseItem?.Nfse?.InfNfse?.Numero || 'Número não identificado',
          erro: error instanceof Error ? error.message : 'Erro ao processar a nota fiscal'
        });
      }
    }

    // Retorna o resultado da importação
    if (notasImportadas.length === 0 && notasErro.length > 0) {
      return res.status(400).json({
        message: 'Nenhuma nota fiscal foi importada',
        detalhes: {
          erros: notasErro
        }
      });
    }

    res.json({
      message: `${notasImportadas.length} nota(s) fiscal(is) importada(s) com sucesso${
        notasErro.length > 0 ? ` e ${notasErro.length} erro(s)` : ''
      }`,
      importadas: notasImportadas.length,
      erros: notasErro.length,
      detalhes: {
        notasImportadas,
        notasErro
      }
    });
  } catch (error) {
    console.error('Erro ao importar notas fiscais:', error);
    res.status(500).json({
      message: 'Erro ao importar notas fiscais',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;