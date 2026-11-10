import { MyProfilePage } from '../pages/account/MyProfilePage'
import { AccountLoginPage } from '../pages/account/MyProductsPage'
import { PendingApprovalPage } from '../pages/backoffice/PendingApprovalPage'
import { UserLinksPage } from '../pages/backoffice/UserLinksPage'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import {
  isAdminAuthToken,
  isAuthTokenValid,
  removeAuthToken,
} from '../shared/api/auth-token'
import { BannersPage } from '../pages/backoffice/BannersPage'
import { DestaquesPage } from '../pages/backoffice/DestaquesPage'
import { LoginPage } from '../pages/backoffice/LoginPage'
import { ProducersReviewPage } from '../pages/backoffice/ProducersReviewPage'
import { ProductsReviewPage } from '../pages/backoffice/ProductsReviewPage'
import { AboutPage } from '../pages/catalog/AboutPage'
import { CatalogPage } from '../pages/catalog/CatalogPage'
import { InscriptionPage } from '../pages/catalog/InscriptionPage'
import { ProducerDetailPage } from '../pages/catalog/ProducerDetailPage'
import { ProductDetailPage } from '../pages/catalog/ProductDetailPage'
import { ProducersPage } from '../pages/catalog/ProducersPage'
import { BackofficeLayout } from './BackofficeLayout'
import { CatalogLayout } from './CatalogLayout'

function ProtectedRoute() {
  if (!isAuthTokenValid()) {
    removeAuthToken()
    return <Navigate to="/backoffice/login" replace />
  }

  if (!isAdminAuthToken()) {
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
          <Route path="produtores/:id" element={<ProducerDetailPage />} />
          <Route path="produtos/:id" element={<ProductDetailPage />} />
          <Route path="minha-conta/login" element={<AccountLoginPage />} />
          <Route path="minha-conta/perfil" element={<MyProfilePage />} />
          <Route
            path="minha-conta/produtos"
            element={<Navigate to="/minha-conta/perfil" replace />}
          />
          <Route path="inscricao" element={<InscriptionPage />} />
        </Route>

        <Route path="/backoffice/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<BackofficeLayout />}>
            <Route
              path="/backoffice"
              element={<Navigate to="/backoffice/produtores" replace />}
            />
            <Route
              path="/backoffice/produtores"
              element={<ProducersReviewPage />}
            />
            <Route
              path="/backoffice/produtos"
              element={<ProductsReviewPage />}
            />
            <Route
              path="/backoffice/aprovacoes"
              element={<PendingApprovalPage />}
            />
            <Route path="/backoffice/usuarios" element={<UserLinksPage />} />
            <Route path="/backoffice/destaques" element={<DestaquesPage />} />
            <Route path="/backoffice/banners" element={<BannersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
