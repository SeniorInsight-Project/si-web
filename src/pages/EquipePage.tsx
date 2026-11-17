import { AreaEmBreve } from '../components/AreaEmBreve'

export function EquipePage() {
  return (
    <AreaEmBreve
      area="Área da Equipe"
      description="A área de governança aguarda endpoints operacionais para observabilidade, prompts, limites e atendimento LGPD."
      backendNeeds={[
        'Métricas de uso, latência e orçamento do insight-service.',
        'Consulta versionada de prompts e limites operacionais.',
        'Consulta e acompanhamento de solicitações LGPD.',
      ]}
    />
  )
}
