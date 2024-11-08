import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';

interface ConsultarNFSeParams {
  cnpj: string;
  inscricaoMunicipal: string;
  numeroNota?: string;
  dataInicial?: Date;
  dataFinal?: Date;
  clientId: number;
}

export async function consultarNFSeVV({
  cnpj,
  inscricaoMunicipal,
  numeroNota,
  dataInicial,
  dataFinal,
  clientId
}: ConsultarNFSeParams): Promise<any> {
  try {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const consultaXML = `<?xml version="1.0" encoding="UTF-8"?>
<ConsultarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Prestador>
    <CpfCnpj>
      <Cnpj>${cnpj}</Cnpj>
    </CpfCnpj>
    <InscricaoMunicipal>${inscricaoMunicipal}</InscricaoMunicipal>
  </Prestador>
  ${numeroNota ? `<NumeroNfse>${numeroNota}</NumeroNfse>` : ''}
  ${dataInicial && dataFinal ? `
  <PeriodoEmissao>
    <DataInicial>${format(dataInicial, 'yyyy-MM-dd')}</DataInicial>
    <DataFinal>${format(dataFinal, 'yyyy-MM-dd')}</DataFinal>
  </PeriodoEmissao>` : ''}
</ConsultarNfseEnvio>`;

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://nfse.abrasf.org.br">
  <soap:Header/>
  <soap:Body>
    <ns:ConsultarNfse>
      <nfseCabecMsg><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
<cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.03">
  <versaoDados>2.03</versaoDados>
</cabecalho>]]></nfseCabecMsg>
      <nfseDadosMsg>${consultaXML}</nfseDadosMsg>
    </ns:ConsultarNfse>
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch('http://localhost:3001/api/nfse/consultar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        soapEnvelope,
        clientId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao consultar NFSe');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao consultar NFSe:', error);
    throw error;
  }
}

export async function importarNFSeVV(clientId: number, xmlContent: string): Promise<any> {
  try {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch('http://localhost:3001/api/nfse/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        clientId,
        xmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao importar NFSe');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao importar NFSe:', error);
    throw error;
  }
}