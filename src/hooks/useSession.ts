import { createContext, useContext } from 'react'
import type { BffSessionResponse } from '../services/authService'

export type SessionContextValue = {
  session: BffSessionResponse
  isLoading: boolean
  isAuthenticated: boolean
  /** O gateway não respondeu; a sessão está fechada e o portal oferece nova tentativa. */
  isUnavailable: boolean
  isRetrying: boolean
  retry: () => void
  loginWithKeycloak: () => void
  logout: () => Promise<void>
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession deve ser utilizado dentro de um SessionProvider.')
  }

  return context
}
