import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { PortalLayout } from './components/PortalLayout'
import { ProtectedRoute, SessionProvider } from './components/SessionProvider'
import { LandingPage } from './pages/LandingPage'

const PortalHomePage = lazy(() =>
  import('./pages/PortalHomePage').then((module) => ({ default: module.PortalHomePage })),
)
const FamiliarPage = lazy(() =>
  import('./pages/FamiliarPage').then((module) => ({ default: module.FamiliarPage })),
)
const MedicoPage = lazy(() =>
  import('./pages/MedicoPage').then((module) => ({ default: module.MedicoPage })),
)
const OperadoraPage = lazy(() =>
  import('./pages/OperadoraPage').then((module) => ({ default: module.OperadoraPage })),
)
const EquipePage = lazy(() =>
  import('./pages/EquipePage').then((module) => ({ default: module.EquipePage })),
)

function App() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <div className="container" style={{ padding: '48px 24px' }}>
            <p className="portal-muted">Carregando portal…</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalHomePage />} />
            <Route
              path="familiar"
              element={
                <ProtectedRoute requiredRole="FAMILIAR">
                  <FamiliarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="medico"
              element={
                <ProtectedRoute requiredRole="MEDICO">
                  <MedicoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="operadora"
              element={
                <ProtectedRoute requiredRole="OPERADORA">
                  <OperadoraPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="equipe"
              element={
                <ProtectedRoute requiredRole="EQUIPE">
                  <EquipePage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </SessionProvider>
  )
}

export default App
