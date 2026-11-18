import type { IconName } from './components/Icon'
import type { PortalRole } from './services/authService'

/** Visões do /portal. A área da equipe não entra aqui: fica em /interno, sem link. */
export type PortalView = {
  role: Exclude<PortalRole, 'EQUIPE'>
  to: string
  label: string
  icon: IconName
  tone: 'green' | 'blue' | 'purple'
  badge: string
  title: string
  description: string
}

export const PORTAL_VIEWS: PortalView[] = [
  {
    role: 'FAMILIAR',
    to: '/portal/familiar',
    label: 'Familiar',
    icon: 'heart',
    tone: 'green',
    badge: 'Família',
    title: 'Área do Familiar',
    description:
      'Bem-estar do dia, rotina de remédios, alertas e rede de cuidado de quem você acompanha.',
  },
  {
    role: 'MEDICO',
    to: '/portal/medico',
    label: 'Médico',
    icon: 'clipboard',
    tone: 'blue',
    badge: 'Clínico · Somente leitura',
    title: 'Área do Médico',
    description:
      'Pacientes que autorizaram o seu acompanhamento, com evolução e relatórios semanais.',
  },
  {
    role: 'OPERADORA',
    to: '/portal/operadora',
    label: 'Operadora',
    icon: 'users',
    tone: 'purple',
    badge: 'Saúde suplementar',
    title: 'Área da Operadora',
    description:
      'Carteira de beneficiários por faixa de risco, sem exposição nominal, e importação em lote.',
  },
]

export function viewsForRoles(roles: readonly PortalRole[]): PortalView[] {
  return PORTAL_VIEWS.filter((view) => roles.includes(view.role))
}
