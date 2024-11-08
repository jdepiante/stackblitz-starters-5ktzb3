export interface User {
  id: string;
  username: string;
  token: string;
}

export interface Client {
  id_cliente: number;
  nome_cliente: string;
  dia_fechamento: number;
  gestor: string;
  total_horas_contratadas: string;
}

export interface Status {
  id_status: number;
  status: string;
}

export interface Prioridade {
  id_prioridade: number;
  prioridade: string;
}

export interface SolicitanteDemanda {
  id_solicitante_demanda: number;
  nome_solicitante_demanda: string;
  id_cliente: number;
}

export interface Support {
  id_suporte: number;
  id_cliente: number;
  id_status: number;
  id_prioridade: number;
  id_solicitante_demanda: number;
  primeiro_contato: string;
  inicio_suporte: string;
  fim_suporte: string;
  data_suporte: string;
  duracao: string;
  nome_tarefa: string;
  descricao_suporte: string;
  cliente: Client;
  status: Status;
  prioridade: Prioridade;
  solicitante_demanda: SolicitanteDemanda;
}

export interface NFSeData {
  numero: string;
  codigo_verificacao: string;
  data_emissao: string;
  competencia: string;
  valor_servicos: number;
  valor_liquido: number;
  discriminacao: string;
}