import React from 'react';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { generateNFSePDF } from '../utils/nfsePdfGenerator';

interface NFSeVVResultadoProps {
  nfseData: any;
}

export function NFSeVVResultado({ nfseData }: NFSeVVResultadoProps) {
  const handleGeneratePDF = () => {
    try {
      generateNFSePDF(nfseData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF da nota fiscal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Resultado da Consulta</h3>
        <button
          onClick={handleGeneratePDF}
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-900"
          title="Gerar PDF"
        >
          <FileText className="w-4 h-4" />
          Gerar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Informações da Nota</h4>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Número:</span> {nfseData.numeroNota}</p>
              <p><span className="font-medium">Código de Verificação:</span> {nfseData.codigoVerificacao}</p>
              <p><span className="font-medium">Data de Emissão:</span> {format(new Date(nfseData.dataEmissao), 'dd/MM/yyyy')}</p>
              <p><span className="font-medium">Competência:</span> {format(new Date(nfseData.competencia), 'MM/yyyy')}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Valores</h4>
            <div className="mt-2 space-y-2">
              <p>
                <span className="font-medium">Valor dos Serviços:</span>{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nfseData.valorServicos)}
              </p>
              <p>
                <span className="font-medium">Valor Líquido:</span>{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nfseData.valorLiquido)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Prestador</h4>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Razão Social:</span> {nfseData.prestador.razaoSocial}</p>
              <p><span className="font-medium">CNPJ:</span> {nfseData.prestador.cnpj}</p>
              <p><span className="font-medium">Inscrição Municipal:</span> {nfseData.prestador.inscricaoMunicipal}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Tomador</h4>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Razão Social:</span> {nfseData.tomador.razaoSocial}</p>
              <p><span className="font-medium">CNPJ:</span> {nfseData.tomador.cnpj}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500">Discriminação dos Serviços</h4>
        <p className="mt-2 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
          {nfseData.discriminacao}
        </p>
      </div>
    </div>
  );
}