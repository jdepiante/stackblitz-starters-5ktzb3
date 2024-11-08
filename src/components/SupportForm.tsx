import React from 'react';
import { X } from 'lucide-react';
import { format, parse } from 'date-fns';
import type { Client, Status, Prioridade, SolicitanteDemanda } from '../types';

interface SupportFormProps {
  isEditing: boolean;
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  clients: Client[];
  statusList: Status[];
  prioridades: Prioridade[];
  filteredSolicitantes: SolicitanteDemanda[];
}

export function SupportForm({
  isEditing,
  formData,
  handleChange,
  handleSubmit,
  onClose,
  clients,
  statusList,
  prioridades,
  filteredSolicitantes
}: SupportFormProps) {
  // Função auxiliar para formatar a data para o formato do input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Converte a string de data para objeto Date
      const date = new Date(dateString);
      // Verifica se a data é válida
      if (isNaN(date.getTime())) return '';
      // Formata para o formato esperado pelo input datetime-local
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  };

  // Handler personalizado para campos de data
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    try {
      // Se o valor estiver vazio e for primeiro_contato, permite
      if (value === '' && name === 'primeiro_contato') {
        handleChange(e);
        return;
      }

      // Valida se a data é válida
      const date = value ? new Date(value) : null;
      if (date && !isNaN(date.getTime())) {
        handleChange(e);
      }
    } catch (error) {
      console.error('Data inválida:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar Atendimento' : 'Novo Atendimento'}
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select
              name="id_cliente"
              value={formData.id_cliente}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              disabled={isEditing}
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
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="id_status"
              value={formData.id_status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Selecione um status</option>
              {statusList.map(status => (
                <option key={status.id_status} value={status.id_status}>
                  {status.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prioridade</label>
            <select
              name="id_prioridade"
              value={formData.id_prioridade}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Selecione uma prioridade</option>
              {prioridades.map(prioridade => (
                <option key={prioridade.id_prioridade} value={prioridade.id_prioridade}>
                  {prioridade.prioridade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Solicitante</label>
            <select
              name="id_solicitante_demanda"
              value={formData.id_solicitante_demanda}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              disabled={!formData.id_cliente || isEditing}
            >
              <option value="">Selecione um solicitante</option>
              {filteredSolicitantes.map(solicitante => (
                <option key={solicitante.id_solicitante_demanda} value={solicitante.id_solicitante_demanda}>
                  {solicitante.nome_solicitante_demanda}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nome da Tarefa</label>
            <input
              type="text"
              name="nome_tarefa"
              value={formData.nome_tarefa}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              name="descricao_suporte"
              value={formData.descricao_suporte}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Primeiro Contato (opcional)
              <span className="text-xs text-gray-500 ml-1">(dd/mm/aaaa hh:mm)</span>
            </label>
            <input
              type="datetime-local"
              name="primeiro_contato"
              value={formatDateForInput(formData.primeiro_contato)}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Início do Suporte
              <span className="text-xs text-gray-500 ml-1">(dd/mm/aaaa hh:mm)</span>
            </label>
            <input
              type="datetime-local"
              name="inicio_suporte"
              value={formatDateForInput(formData.inicio_suporte)}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fim do Suporte
              <span className="text-xs text-gray-500 ml-1">(dd/mm/aaaa hh:mm)</span>
            </label>
            <input
              type="datetime-local"
              name="fim_suporte"
              value={formatDateForInput(formData.fim_suporte)}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {isEditing ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}