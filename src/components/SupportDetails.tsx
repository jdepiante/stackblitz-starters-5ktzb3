import React from 'react';
import { X, Edit } from 'lucide-react';
import { format } from 'date-fns';
import type { Support } from '../types';

interface SupportDetailsProps {
  support: Support;
  onClose: () => void;
  onEdit: (support: Support) => void;
}

export function SupportDetails({ support, onClose, onEdit }: SupportDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Detalhes do Atendimento</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
              <p className="mt-1">{support.cliente.nome_cliente}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">{support.status.status}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Prioridade</h3>
              <p className="mt-1">{support.prioridade.prioridade}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Solicitante</h3>
              <p className="mt-1">{support.solicitante_demanda.nome_solicitante_demanda}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Nome da Tarefa</h3>
            <p className="mt-1">{support.nome_tarefa}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
            <p className="mt-1 whitespace-pre-wrap">{support.descricao_suporte}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Primeiro Contato</h3>
              <p className="mt-1">{format(new Date(support.primeiro_contato), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Início do Suporte</h3>
              <p className="mt-1">{format(new Date(support.inicio_suporte), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fim do Suporte</h3>
              <p className="mt-1">{format(new Date(support.fim_suporte), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Duração</h3>
              <p className="mt-1">{support.duracao}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                onClose();
                onEdit(support);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}