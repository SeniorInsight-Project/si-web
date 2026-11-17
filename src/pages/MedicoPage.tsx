import { AreaEmBreve } from '../components/AreaEmBreve'

export function MedicoPage() {
  return (
    <AreaEmBreve
      area="Área do Médico"
      description="A integração clínica ainda depende dos endpoints de pacientes, autorização da família, evolução e relatórios."
      backendNeeds={[
        'Lista de pacientes autorizados e vínculo clínico no si-care-service #90.',
        'Leituras clínicas longitudinais e relatórios semanais para o portal (si-web #10).',
      ]}
    />
  )
}
