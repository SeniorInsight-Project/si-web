import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { PortalLayout } from './components/PortalLayout'
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
          <Route path="familiar" element={<FamiliarPage />} />
          <Route path="medico" element={<MedicoPage />} />
          <Route path="operadora" element={<OperadoraPage />} />
          <Route path="equipe" element={<EquipePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
