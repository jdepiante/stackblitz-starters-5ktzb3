import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { NFSeVVConsulta } from '../components/NFSeVVConsulta';
import { NFSeVVResultado } from '../components/NFSeVVResultado';
import { NFSeUpload } from '../components/NFSeUpload';
import { NFSeList } from '../components/NFSeList';
import type { Client } from '../types';

export default function NFSe() {
  const [consultaResult, setConsultaResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'consulta' | 'importacao'>('consulta');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [nfseList, setNfseList] = useState<any[]>([]);
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
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  const handleNFSeFound = (nfseData: any) => {
    setConsultaResult(nfseData);
    fetchNFSeList();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const xmlContent = e.target?.result as string;
        const response = await fetch('http://localhost:3001/api/nfse/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ xmlContent })
        });

        if (response.status === 403) {
          handleAuthError();
          return;
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao importar XML');
        }

        await fetchNFSeList();
        setSelectedFile(null);
        // Limpar o input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } catch (error) {
        console.error('Erro ao importar XML:', error);
        alert(error instanceof Error ? error.message : 'Erro ao importar XML');
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(selectedFile);
  };

  const fetchNFSeList = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/nfse', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) throw new Error('Erro ao buscar notas fiscais');
      const data = await response.json();
      setNfseList(data);
    } catch (error) {
      console.error('Erro ao buscar notas fiscais:', error);
      if (error instanceof Error && error.message.includes('403')) {
        handleAuthError();
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchNFSeList();
    }
  }, [token]);

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais de Serviço</h1>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('consulta')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'consulta'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consulta NFSe Vila Velha
            </button>
            <button
              onClick={() => setActiveTab('importacao')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'importacao'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Importação de XML
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'consulta' ? (
            <div className="space-y-6">
              <NFSeVVConsulta onNFSeFound={handleNFSeFound} clients={clients} />
              {consultaResult && <NFSeVVResultado nfseData={consultaResult} />}
            </div>
          ) : (
            <div className="space-y-6">
              <NFSeUpload
                onFileChange={handleFileChange}
                onUpload={handleUpload}
                selectedFile={selectedFile}
                isUploading={isUploading}
              />
            </div>
          )}

          <NFSeList nfseList={nfseList} />
        </div>
      </div>
    </div>
  );
}