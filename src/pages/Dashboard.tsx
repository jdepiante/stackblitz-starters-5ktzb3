import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Headphones, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Client, Support } from '../types';

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    monthlySupports: 0,
    totalHours: 0,
    pendingSupports: 0
  });
  const [recentSupports, setRecentSupports] = useState<Support[]>([]);
  const [topClients, setTopClients] = useState<{nome_cliente: string, total: number}[]>([]);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [token, navigate]);

  const handleAuthError = () => {
    logout();
    navigate('/login');
  };

  const fetchDashboardData = async () => {
    try {
      // Buscar clientes
      const clientsResponse = await fetch('http://localhost:3001/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (clientsResponse.status === 403) {
        handleAuthError();
        return;
      }

      if (!clientsResponse.ok) {
        throw new Error('Erro ao buscar clientes');
      }
      
      const clients: Client[] = await clientsResponse.json();

      // Buscar atendimentos
      const supportsResponse = await fetch('http://localhost:3001/api/supports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (supportsResponse.status === 403) {
        handleAuthError();
        return;
      }

      if (!supportsResponse.ok) {
        throw new Error('Erro ao buscar atendimentos');
      }
      
      const supportsData = await supportsResponse.json();

      // Validar se a resposta é um array
      if (!Array.isArray(supportsData)) {
        throw new Error('Resposta inválida da API de atendimentos');
      }

      const supports: Support[] = supportsData;

      // Calcular estatísticas
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthlySupports = supports.filter((support) => 
        new Date(support.data_suporte) >= firstDayOfMonth
      );

      const pendingSupports = supports.filter((support) => 
        support.status.status === 'Em andamento'
      );

      const totalHours = supports.reduce((acc, support) => {
        const hours = parseFloat(support.duracao.replace('h', ''));
        return acc + (isNaN(hours) ? 0 : hours);
      }, 0);

      // Calcular clientes com mais demandas
      const clientDemands = supports.reduce((acc: {[key: string]: number}, support) => {
        const clientId = support.id_cliente;
        acc[clientId] = (acc[clientId] || 0) + 1;
        return acc;
      }, {});

      const topClientsList = Object.entries(clientDemands)
        .map(([clientId, total]) => ({
          nome_cliente: clients.find((c) => c.id_cliente === parseInt(clientId))?.nome_cliente || 'Cliente não encontrado',
          total: total
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setStats({
        totalClients: clients.length,
        monthlySupports: monthlySupports.length,
        totalHours: Math.round(totalHours * 100) / 100,
        pendingSupports: pendingSupports.length
      });

      setRecentSupports(supports.slice(0, 5));
      setTopClients(topClientsList);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-semibold">{stats.totalClients}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Atendimentos do Mês</p>
              <p className="text-2xl font-semibold">{stats.monthlySupports}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Headphones className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Horas Trabalhadas</p>
              <p className="text-2xl font-semibold">{stats.totalHours}h</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-semibold">{stats.pendingSupports}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Atendimentos Recentes</h2>
          <div className="space-y-4">
            {recentSupports.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentSupports.map((support) => (
                  <div key={support.id_suporte} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{support.nome_tarefa}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(support.data_suporte), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        support.status.status === 'Em andamento' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : support.status.status === 'Concluído'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {support.status.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum atendimento registrado</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Clientes com Mais Demandas</h2>
          <div className="space-y-4">
            {topClients.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {topClients.map((client, index) => (
                  <div key={index} className="py-3 flex justify-between items-center">
                    <span className="font-medium">{client.nome_cliente}</span>
                    <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                      {client.total} atendimentos
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;