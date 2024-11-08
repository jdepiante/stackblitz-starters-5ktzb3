import React, { useState, useEffect } from 'react';
import { FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Client } from '../types';
import { ReportFilters } from '../components/ReportFilters';
import { HoursControlFilters } from '../components/HoursControlFilters';
import { generateClientReport, generateHoursControlReport } from '../utils/reportGenerator';

export default function Reports() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [hoursControlClient, setHoursControlClient] = useState('');
  const [hoursControlYear, setHoursControlYear] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

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

      if (!response.ok) throw new Error('Erro ao buscar clientes');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setError('Erro ao carregar clientes. Por favor, tente novamente.');
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const handleGenerateReport = async (type: 'client' | 'hours') => {
    try {
      setError(null);

      if (type === 'hours') {
        if (!hoursControlYear || !hoursControlClient) {
          setError('Cliente e ano são obrigatórios');
          return;
        }
      } else {
        if (!selectedMonth || !selectedYear || !selectedClient) {
          setError('Cliente, mês e ano são obrigatórios');
          return;
        }
      }

      const url = type === 'hours'
        ? `http://localhost:3001/api/reports/hours-control?year=${hoursControlYear}&clientId=${hoursControlClient}`
        : `http://localhost:3001/api/reports/client/${selectedClient}?month=${selectedMonth}&year=${selectedYear}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao gerar relatório ${type}`);
      }

      const data = await response.json();

      if (type === 'client') {
        generateClientReport(data, selectedMonth, selectedYear);
      } else {
        generateHoursControlReport(data, hoursControlYear);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar relatório');
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  if (!token) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Relatório de Atendimento por Cliente</h2>
            <ReportFilters
              clients={clients}
              selectedClient={selectedClient}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onClientChange={(e) => setSelectedClient(e.target.value)}
              onMonthChange={(e) => setSelectedMonth(e.target.value)}
              onYearChange={(e) => setSelectedYear(e.target.value)}
            />
            <button
              onClick={() => handleGenerateReport('client')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <FileDown className="w-4 h-4" />
              Gerar Relatório
            </button>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Controle de Horas</h2>
            <HoursControlFilters
              clients={clients}
              selectedClient={hoursControlClient}
              selectedYear={hoursControlYear}
              onClientChange={(e) => setHoursControlClient(e.target.value)}
              onYearChange={(e) => setHoursControlYear(e.target.value)}
            />
            <button
              onClick={() => handleGenerateReport('hours')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <FileDown className="w-4 h-4" />
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}