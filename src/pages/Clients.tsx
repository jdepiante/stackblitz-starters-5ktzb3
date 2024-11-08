import React, { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import type { Client } from '../types';

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_cliente: '',
    nome_cliente: '',
    gestor: '',
    dia_fechamento: '',
    total_horas_contratadas: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchClients();
  }, [token, navigate]);

  const handleAuthError = () => {
    logout();
    navigate('/login');
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
      }
      
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `http://localhost:3001/api/clients/${formData.id_cliente}`
        : 'http://localhost:3001/api/clients';
        
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          dia_fechamento: parseInt(formData.dia_fechamento)
        })
      });

      if (response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} cliente`);
      }

      setShowModal(false);
      setFormData({
        id_cliente: '',
        nome_cliente: '',
        gestor: '',
        dia_fechamento: '',
        total_horas_contratadas: ''
      });
      setIsEditing(false);
      fetchClients();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const handleEdit = (client: Client) => {
    setFormData({
      id_cliente: client.id_cliente.toString(),
      nome_cliente: client.nome_cliente,
      gestor: client.gestor,
      dia_fechamento: client.dia_fechamento.toString(),
      total_horas_contratadas: client.total_horas_contratadas
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button 
          onClick={() => {
            setIsEditing(false);
            setFormData({
              id_cliente: '',
              nome_cliente: '',
              gestor: '',
              dia_fechamento: '',
              total_horas_contratadas: ''
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <UserPlus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
                <input
                  type="text"
                  name="nome_cliente"
                  value={formData.nome_cliente}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gestor</label>
                <input
                  type="text"
                  name="gestor"
                  value={formData.gestor}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dia do Fechamento</label>
                <input
                  type="number"
                  name="dia_fechamento"
                  value={formData.dia_fechamento}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total de Horas Contratadas</label>
                <input
                  type="text"
                  name="total_horas_contratadas"
                  value={formData.total_horas_contratadas}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gestor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dia Fechamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas Contratadas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id_cliente}>
                  <td className="px-6 py-4 whitespace-nowrap">{client.nome_cliente}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.gestor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.dia_fechamento}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.total_horas_contratadas}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(client)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Clients;