import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Support, Client, Status, Prioridade, SolicitanteDemanda } from '../types';
import { SupportForm } from '../components/SupportForm';
import { SupportDetails } from '../components/SupportDetails';
import { SupportList } from '../components/SupportList';
import { SupportFilters } from '../components/SupportFilters';

export default function Supports() {
  const [supports, setSupports] = useState<Support[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridade[]>([]);
  const [solicitantes, setSolicitantes] = useState<SolicitanteDemanda[]>([]);
  const [filteredSolicitantes, setFilteredSolicitantes] = useState<SolicitanteDemanda[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Filtros
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const [formData, setFormData] = useState({
    id_cliente: '',
    id_status: '',
    id_prioridade: '',
    id_solicitante_demanda: '',
    primeiro_contato: '',
    inicio_suporte: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    fim_suporte: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    nome_tarefa: '',
    descricao_suporte: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInitialData();
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      fetchFilteredSupports();
    }
  }, [token, selectedClient, selectedMonth, selectedYear]);

  useEffect(() => {
    if (formData.id_cliente) {
      const clientSolicitantes = solicitantes.filter(
        s => s.id_cliente === parseInt(formData.id_cliente)
      );
      setFilteredSolicitantes(clientSolicitantes);
    } else {
      setFilteredSolicitantes([]);
    }
  }, [formData.id_cliente, solicitantes]);

  const handleAuthError = () => {
    logout();
    navigate('/login');
  };

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchClients(),
        fetchStatus(),
        fetchPrioridades(),
        fetchSolicitantes()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
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
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) throw new Error('Erro ao buscar status');
      const data = await response.json();
      setStatusList(data);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const fetchPrioridades = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/prioridades', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) throw new Error('Erro ao buscar prioridades');
      const data = await response.json();
      setPrioridades(data);
    } catch (error) {
      console.error('Erro ao buscar prioridades:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const fetchSolicitantes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/solicitantes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) throw new Error('Erro ao buscar solicitantes');
      const data = await response.json();
      setSolicitantes(data);
    } catch (error) {
      console.error('Erro ao buscar solicitantes:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const fetchFilteredSupports = async () => {
    try {
      let url = 'http://localhost:3001/api/supports?';
      
      if (selectedClient) {
        url += `clientId=${selectedClient}&`;
      }
      if (selectedMonth) {
        url += `month=${selectedMonth}&`;
      }
      if (selectedYear) {
        url += `year=${selectedYear}&`;
      }

      const response = await fetch(url.slice(0, -1), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) throw new Error('Erro ao buscar atendimentos filtrados');
      const data = await response.json();
      setSupports(data);
    } catch (error) {
      console.error('Erro ao buscar atendimentos filtrados:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `http://localhost:3001/api/supports/${selectedSupport?.id_suporte}`
        : 'http://localhost:3001/api/supports';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar atendimento');
      }

      setShowModal(false);
      resetForm();
      fetchFilteredSupports();
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (support: Support) => {
    setSelectedSupport(support);
    setFormData({
      id_cliente: String(support.id_cliente),
      id_status: String(support.id_status),
      id_prioridade: String(support.id_prioridade),
      id_solicitante_demanda: String(support.id_solicitante_demanda),
      primeiro_contato: support.primeiro_contato ? format(new Date(support.primeiro_contato), "yyyy-MM-dd'T'HH:mm") : '',
      inicio_suporte: format(new Date(support.inicio_suporte), "yyyy-MM-dd'T'HH:mm"),
      fim_suporte: format(new Date(support.fim_suporte), "yyyy-MM-dd'T'HH:mm"),
      nome_tarefa: support.nome_tarefa,
      descricao_suporte: support.descricao_suporte
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id_cliente: '',
      id_status: '',
      id_prioridade: '',
      id_solicitante_demanda: '',
      primeiro_contato: '',
      inicio_suporte: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      fim_suporte: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      nome_tarefa: '',
      descricao_suporte: ''
    });
    setIsEditing(false);
    setSelectedSupport(null);
  };

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
        <button 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="w-4 h-4" />
          Novo Atendimento
        </button>
      </div>

      <SupportFilters
        clients={clients}
        selectedClient={selectedClient}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onClientChange={(e) => setSelectedClient(e.target.value)}
        onMonthChange={(e) => setSelectedMonth(e.target.value)}
        onYearChange={(e) => setSelectedYear(e.target.value)}
      />

      <SupportList
        supports={supports}
        onViewDetails={(support) => {
          setSelectedSupport(support);
          setShowDetails(true);
        }}
        onEdit={handleEdit}
      />

      {showModal && (
        <SupportForm
          isEditing={isEditing}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          clients={clients}
          statusList={statusList}
          prioridades={prioridades}
          filteredSolicitantes={filteredSolicitantes}
        />
      )}

      {showDetails && selectedSupport && (
        <SupportDetails
          support={selectedSupport}
          onClose={() => {
            setShowDetails(false);
            setSelectedSupport(null);
          }}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}