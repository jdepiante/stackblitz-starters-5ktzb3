import React from 'react';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import type { NFSeData } from '../types';
import { generateNFSePDF } from '../utils/nfsePdfGenerator';

interface NFSeListProps {
  nfseList: NFSeData[];
}

export function NFSeList({ nfseList }: NFSeListProps) {
  const handleGeneratePDF = async (nfse: any) => {
    try {
      if (!nfse.xml_content) {
        alert('Conteúdo XML não disponível para esta nota fiscal');
        return;
      }

      // Verifica se já temos os dados parseados do XML
      if (nfse.xmlData) {
        generateNFSePDF(nfse.xmlData);
        return;
      }

      // Se não tiver os dados parseados, tenta extrair do XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(nfse.xml_content, "text/xml");
      
      // Remove namespaces para facilitar a seleção dos elementos
      const xmlString = new XMLSerializer().serializeToString(xmlDoc)
        .replace(/xmlns(:[a-z]+)?="[^"]+"/g, '')
        .replace(/[a-z]+:/g, '');
      
      const cleanXmlDoc = parser.parseFromString(xmlString, "text/xml");
      
      // Extrai os dados necessários
      const infNfse = cleanXmlDoc.querySelector('InfNfse');
      if (!infNfse) {
        throw new Error('Dados da nota fiscal não encontrados no XML');
      }

      const nfseData = {
        Numero: getElementText(infNfse, 'Numero'),
        CodigoVerificacao: getElementText(infNfse, 'CodigoVerificacao'),
        DataEmissao: getElementText(infNfse, 'DataEmissao'),
        Competencia: getElementText(infNfse, 'Competencia'),
        PrestadorServico: {
          RazaoSocial: getElementText(infNfse, 'PrestadorServico RazaoSocial'),
          IdentificacaoPrestador: {
            Cnpj: getElementText(infNfse, 'PrestadorServico IdentificacaoPrestador Cnpj'),
            InscricaoMunicipal: getElementText(infNfse, 'PrestadorServico IdentificacaoPrestador InscricaoMunicipal')
          },
          Endereco: extractEndereco(infNfse, 'PrestadorServico Endereco')
        },
        TomadorServico: {
          RazaoSocial: getElementText(infNfse, 'TomadorServico RazaoSocial'),
          IdentificacaoTomador: {
            CpfCnpj: {
              Cnpj: getElementText(infNfse, 'TomadorServico IdentificacaoTomador CpfCnpj Cnpj')
            }
          },
          Endereco: extractEndereco(infNfse, 'TomadorServico Endereco')
        },
        Servico: {
          Discriminacao: getElementText(infNfse, 'Servico Discriminacao'),
          Valores: {
            ValorServicos: getElementText(infNfse, 'Servico Valores ValorServicos'),
            ValorDeducoes: getElementText(infNfse, 'Servico Valores ValorDeducoes'),
            BaseCalculo: getElementText(infNfse, 'Servico Valores BaseCalculo'),
            Aliquota: getElementText(infNfse, 'Servico Valores Aliquota'),
            ValorIss: getElementText(infNfse, 'Servico Valores ValorIss'),
            IssRetido: getElementText(infNfse, 'Servico Valores IssRetido'),
            ValorLiquidoNfse: getElementText(infNfse, 'Servico Valores ValorLiquidoNfse')
          }
        }
      };

      generateNFSePDF(nfseData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF da nota fiscal. Por favor, tente novamente.');
    }
  };

  // Função auxiliar para extrair texto de elementos XML
  const getElementText = (parent: Element, path: string): string => {
    const element = parent.querySelector(path.replace(/ /g, ' > '));
    return element?.textContent || '';
  };

  // Função auxiliar para extrair dados de endereço
  const extractEndereco = (parent: Element, path: string): any => {
    const enderecoElement = parent.querySelector(path.replace(/ /g, ' > '));
    if (!enderecoElement) return {};

    return {
      Endereco: getElementText(enderecoElement, 'Endereco'),
      Numero: getElementText(enderecoElement, 'Numero'),
      Complemento: getElementText(enderecoElement, 'Complemento'),
      Bairro: getElementText(enderecoElement, 'Bairro'),
      Cidade: getElementText(enderecoElement, 'Cidade'),
      Uf: getElementText(enderecoElement, 'Uf'),
      Cep: getElementText(enderecoElement, 'Cep')
    };
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Notas Fiscais Importadas</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Emissão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Serviços
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Líquido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nfseList.map((nfse) => (
              <tr key={`${nfse.numero}-${nfse.codigo_verificacao}`}>
                <td className="px-6 py-4 whitespace-nowrap">{nfse.numero}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(nfse.data_emissao), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(nfse.competencia), 'MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(Number(nfse.valor_servicos))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(Number(nfse.valor_liquido))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleGeneratePDF(nfse)}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                    title="Gerar PDF"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}