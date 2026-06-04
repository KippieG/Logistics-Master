import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage }    from './pages/DashboardPage'
import { SetupPage }        from './pages/SetupPage'
import { AnalysisPage }     from './pages/AnalysisPage'
import { OptimizationPage } from './pages/OptimizationPage'
import { SimulationPage }   from './pages/SimulationPage'
import { ReportPage }       from './pages/ReportPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,         element: <DashboardPage /> },
      { path: 'setup',       element: <SetupPage /> },
      { path: 'analysis',    element: <AnalysisPage /> },
      { path: 'optimization',element: <OptimizationPage /> },
      { path: 'simulation',  element: <SimulationPage /> },
      { path: 'report',      element: <ReportPage /> },
      { path: '*',           element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
