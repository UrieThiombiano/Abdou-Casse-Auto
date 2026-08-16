import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './components/PublicLayout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import OrderForm from './pages/OrderForm'
import PartRequestForm from './pages/PartRequestForm'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

import Login from './pages/admin/Login'
import ForgotPassword from './pages/admin/ForgotPassword'
import ResetPassword from './pages/admin/ResetPassword'
import Dashboard from './pages/admin/Dashboard'
import ListingsManager from './pages/admin/ListingsManager'
import OrdersManager from './pages/admin/OrdersManager'
import PartRequestsManager from './pages/admin/PartRequestsManager'

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/pieces-neuves" element={<Catalog category="neuf" />} />
                        <Route path="/occasion" element={<Catalog category="occasion" />} />
                        <Route path="/produit/:id" element={<ProductDetail />} />
                        <Route path="/commander" element={<OrderForm />} />
                        <Route path="/demander-une-piece" element={<PartRequestForm />} />
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
                            <Route path="/admin/demandes" element={<PartRequestsManager />} />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
