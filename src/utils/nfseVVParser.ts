import { XMLParser } from 'fast-xml-parser';

interface VVNFSeData {
  numeroNota: string;
  codigoVerificacao: string;
  dataEmissao: string;
  competencia: string;
  valorServicos: number;
  valorLiquido: number;
  discriminacao: string;
  prestador: {
    razaoSocial: string;
    cnpj: string;
    inscricaoMunicipal: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
  };
  tomador: {
    razaoSocial: string;
    cnpj: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
  };
  servico: {
    discriminacao: string;
    valores: {
      valorServicos: number;
      valorDeducoes: number;
      baseCalculo: number;
      aliquota: number;
      valorIss: number;
      issRetido: boolean;
      valorLiquido: number;
    };
  };
}

export function parseVVNFSe(xmlContent: string): VVNFSeData {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true
  });

  try {
    const result = parser.parse(xmlContent);
    const nfse = result.CompNfse?.Nfse?.InfNfse;

    if (!nfse) {
      throw new Error('Estrutura da NFSe inválida');
    }

    return {
      numeroNota: nfse.Numero,
      codigoVerificacao: nfse.CodigoVerificacao,
      dataEmissao: nfse.DataEmissao,
      competencia: nfse.Competencia,
      valorServicos: parseFloat(nfse.Servico.Valores.ValorServicos),
      valorLiquido: parseFloat(nfse.Servico.Valores.ValorLiquidoNfse),
      discriminacao: nfse.Servico.Discriminacao,
      prestador: {
        razaoSocial: nfse.PrestadorServico.RazaoSocial,
        cnpj: nfse.PrestadorServico.IdentificacaoPrestador.Cnpj,
        inscricaoMunicipal: nfse.PrestadorServico.IdentificacaoPrestador.InscricaoMunicipal,
        endereco: {
          logradouro: nfse.PrestadorServico.Endereco.Logradouro,
          numero: nfse.PrestadorServico.Endereco.Numero,
          complemento: nfse.PrestadorServico.Endereco.Complemento,
          bairro: nfse.PrestadorServico.Endereco.Bairro,
          cidade: nfse.PrestadorServico.Endereco.Cidade,
          uf: nfse.PrestadorServico.Endereco.Uf,
          cep: nfse.PrestadorServico.Endereco.Cep
        }
      },
      tomador: {
        razaoSocial: nfse.TomadorServico.RazaoSocial,
        cnpj: nfse.TomadorServico.IdentificacaoTomador.CpfCnpj.Cnpj,
        endereco: {
          logradouro: nfse.TomadorServico.Endereco.Logradouro,
          numero: nfse.TomadorServico.Endereco.Numero,
          complemento: nfse.TomadorServico.Endereco.Complemento,
          bairro: nfse.TomadorServico.Endereco.Bairro,
          cidade: nfse.TomadorServico.Endereco.Cidade,
          uf: nfse.TomadorServico.Endereco.Uf,
          cep: nfse.TomadorServico.Endereco.Cep
        }
      },
      servico: {
        discriminacao: nfse.Servico.Discriminacao,
        valores: {
          valorServicos: parseFloat(nfse.Servico.Valores.ValorServicos),
          valorDeducoes: parseFloat(nfse.Servico.Valores.ValorDeducoes || '0'),
          baseCalculo: parseFloat(nfse.Servico.Valores.BaseCalculo),
          aliquota: parseFloat(nfse.Servico.Valores.Aliquota),
          valorIss: parseFloat(nfse.Servico.Valores.ValorIss),
          issRetido: nfse.Servico.Valores.IssRetido === '1',
          valorLiquido: parseFloat(nfse.Servico.Valores.ValorLiquidoNfse)
        }
      }
    };
  } catch (error) {
    console.error('Erro ao fazer parse do XML da NFSe:', error);
    throw new Error('Erro ao processar XML da NFSe de Vila Velha');
  }
}