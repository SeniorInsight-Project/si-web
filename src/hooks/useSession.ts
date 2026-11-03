import { createContext, useContext } from 'react'
import type { BffSessionResponse, PortalRole } from '../services/authService'

export type SessionContextValue = {
  session: BffSessionResponse
  isLoading: boolean
  isAuthenticated: boolean
  loginWithKeycloak: (returnTo?: string) => void
  logout: () => Promise<void>
  switchRole: (role: PortalRole) => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession deve ser utilizado dentro de um SessionProvider.')
  }

  return context
}
