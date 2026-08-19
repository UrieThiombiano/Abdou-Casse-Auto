import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './components/PublicLayout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import OrderForm from './pages/OrderForm'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// Charge a la demande : evite d'alourdir le bundle public (visiteurs du site)
// avec le code et les dependances (ex: generation PDF) reserves a l'admin.
const Login = lazy(() => import('./pages/admin/Login'))
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const ListingsManager = lazy(() => import('./pages/admin/ListingsManager'))
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'))
const OrderBook = lazy(() => import('./pages/admin/OrderBook'))
const ManualOrderForm = lazy(() => import('./pages/admin/ManualOrderForm'))
const PartRequestsManager = lazy(() => import('./pages/admin/PartRequestsManager'))
const Proformas = lazy(() => import('./pages/admin/Proformas'))
const ProformaForm = lazy(() => import('./pages/admin/ProformaForm'))

function AdminFallback() {
    return <div className="min-h-screen flex items-center justify-center text-neutral-500">Chargement…</div>
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Suspense fallback={<AdminFallback />}>
                    <Routes>
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/pieces-neuves" element={<Catalog category="neuf" />} />
                            <Route path="/occasion" element={<Catalog category="occasion" />} />
                            <Route path="/produit/:id" element={<ProductDetail />} />
                            <Route path="/commander" element={<OrderForm />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>

                        <Route path="/admin/login" element={<Login />} />
                        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                        <Route path="/admin/reset-password" element={<ResetPassword />} />

                        <Route element={<ProtectedRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin" element={<Dashboard />} />
                                <Route path="/admin/dashboard" element={<Dashboard />} />
                                <Route path="/admin/annonces" element={<ListingsManager />} />
                                <Route path="/admin/commandes" element={<OrdersManager />} />
                                <Route path="/admin/carnet-de-commandes" element={<OrderBook />} />
                                <Route path="/admin/carnet-de-commandes/nouvelle" element={<ManualOrderForm />} />
                                <Route path="/admin/carnet-de-commandes/:id" element={<ManualOrderForm />} />
                                <Route path="/admin/demandes" element={<PartRequestsManager />} />
                                <Route path="/admin/proformas" element={<Proformas />} />
                                <Route path="/admin/proformas/nouvelle" element={<ProformaForm />} />
                                <Route path="/admin/proformas/:id" element={<ProformaForm />} />
                            </Route>
                        </Route>
                    </Routes>
                </Suspense>
            </AuthProvider>
        </BrowserRouter>
    )
}
