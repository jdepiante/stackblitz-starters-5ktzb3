import React from 'react';
import type { Client } from '../types';

interface SupportFiltersProps {
  clients: Client[];
  selectedClient: string;
  selectedMonth: string;
  selectedYear: string;
  onClientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMonthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SupportFilters({
  clients,
  selectedClient,
  selectedMonth,
  selectedYear,
  onClientChange,
  onMonthChange,
  onYearChange
}: SupportFiltersProps) {
  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: String(year), label: String(year) };
  });

  return (
    <div className="flex gap-4">
      <div className="w-64">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filtrar por Cliente
        </label>
        <select
          value={selectedClient}
          onChange={onClientChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Todos os clientes</option>
          {clients.map(client => (
            <option key={client.id_cliente} value={client.id_cliente}>
              {client.nome_cliente}
            </option>
          ))}
        </select>
      </div>

      <div className="w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filtrar por Mês
        </label>
        <select
          value={selectedMonth}
          onChange={onMonthChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Todos os meses</option>
          {months.map(month => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-36">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filtrar por Ano
        </label>
        <select
          value={selectedYear}
          onChange={onYearChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Todos os anos</option>
          {years.map(year => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}