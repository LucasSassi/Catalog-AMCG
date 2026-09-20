import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { hasAuthToken } from '../shared/api/auth-token'
import { BackofficePage } from '../pages/backoffice/BackofficePage'
import { LoginPage } from '../pages/backoffice/LoginPage'
import { AboutPage } from '../pages/catalog/AboutPage'
import { CatalogPage } from '../pages/catalog/CatalogPage'
import { ProductDetailPage } from '../pages/catalog/ProductDetailPage'
import { ProducersPage } from '../pages/catalog/ProducersPage'
import { BackofficeLayout } from './BackofficeLayout'
import { CatalogLayout } from './CatalogLayout'

function ProtectedRoute() {
  if (!hasAuthToken()) {
    return <Navigate to="/backoffice/login" replace />
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CatalogLayout />}>
          <Route index element={<CatalogPage />} />
          <Route path="quem-somos" element={<AboutPage />} />
          <Route path="produtores" element={<ProducersPage />} />
          <Route path="produtos/:id" element={<ProductDetailPage />} />
        </Route>

        <Route path="/backoffice/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<BackofficeLayout />}>
            <Route path="/backoffice" element={<BackofficePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
