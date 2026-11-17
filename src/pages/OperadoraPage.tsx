import { AreaEmBreve } from '../components/AreaEmBreve'

export function OperadoraPage() {
  return (
    <AreaEmBreve
      area="Área da Operadora"
      description="A visão B2B será liberada quando houver contratos para carteira agregada, elegibilidade e faturamento."
      backendNeeds={[
        'Endpoint de carteira por faixa de risco com dados agregados e pseudonimizados.',
        'Importação/consulta de beneficiários elegíveis e indicadores de sincronização.',
        'Integração de cobrança e direito de uso para a conta da operadora.',
      ]}
    />
  )
}
