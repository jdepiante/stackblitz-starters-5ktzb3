import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { consultarNFSeVV, importarNFSeVV } from '../utils/nfseVVService';
import { Alert } from './Alert';
import type { Client } from '../types';

interface NFSeVVConsultaProps {
  onNFSeFound: (nfseData: any) => void;
  clients: Client[];
}

export function NFSeVVConsulta({ onNFSeFound, clients }: NFSeVVConsultaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    cnpj: '',
    inscricaoMunicipal: '',
    numeroNota: '',
    dataInicial: '',
    dataFinal: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!formData.clientId) {
        throw new Error('Selecione um cliente');
      }

      if (!formData.cnpj || !formData.inscricaoMunicipal) {
        throw new Error('CNPJ e Inscrição Municipal são obrigatórios');
      }

      const params: any = {
        cnpj: formData.cnpj.replace(/\D/g, ''),
        inscricaoMunicipal: formData.inscricaoMunicipal
      };

      if (formData.numeroNota) {
        params.numeroNota = formData.numeroNota;
      }

      if (formData.dataInicial && formData.dataFinal) {
        params.dataInicial = new Date(formData.dataInicial);
        params.dataFinal = new Date(formData.dataFinal);
      }

      const xmlResponse = await consultarNFSeVV(params);
      
      // Importar as notas encontradas
      const importResult = await importarNFSeVV(parseInt(formData.clientId), xmlResponse);
      
      setSuccess(`${importResult.importadas} nota(s) fiscal(is) importada(s) com sucesso${
        importResult.erros > 0 ? ` e ${importResult.erros} erro(s)` : ''
      }`);

      // Atualizar a lista de notas
      if (importResult.detalhes?.notasImportadas?.length > 0) {
        onNFSeFound(importResult.detalhes.notasImportadas);
      }
    } catch (error) {
      console.error('Erro na consulta:', error);
      setError(error instanceof Error ? error.message : 'Erro ao consultar NFSe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Consultar e Importar NFSe Vila Velha</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map(client => (
                <option key={client.id_cliente} value={client.id_cliente}>
                  {client.nome_cliente}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ do Prestador
            </label>
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inscrição Municipal
            </label>
            <input
              type="text"
              name="inscricaoMunicipal"
              value={formData.inscricaoMunicipal}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número da Nota (opcional)
            </label>
            <input
              type="text"
              name="numeroNota"
              value={formData.numeroNota}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial (opcional)
            </label>
            <input
              type="date"
              name="dataInicial"
              value={formData.dataInicial}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final (opcional)
            </label>
            <input
              type="date"
              name="dataFinal"
              value={formData.dataFinal}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md text-white transition-colors
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          <Search className="w-4 h-4" />
          {isLoading ? 'Consultando...' : 'Consultar e Importar NFSe'}
        </button>
      </form>
    </div>
  );
}