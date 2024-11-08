import React from 'react';
import type { Client } from '../types';
import { getYears } from './ReportFilters';

interface HoursControlFiltersProps {
  clients: Client[];
  selectedClient: string;
  selectedYear: string;
  onClientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function HoursControlFilters({
  clients,
  selectedClient,
  selectedYear,
  onClientChange,
  onYearChange
}: HoursControlFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente
        </label>
        <select
          value={selectedClient}
          onChange={onClientChange}
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
          Ano
        </label>
        <select
          value={selectedYear}
          onChange={onYearChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Selecione um ano</option>
          {getYears().map(year => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}