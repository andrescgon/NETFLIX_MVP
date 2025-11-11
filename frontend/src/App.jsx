import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ProfileProvider } from './context/ProfileContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProfileSelection from './pages/ProfileSelection';
import ManageProfiles from './pages/ManageProfiles';
import Player from './pages/Player';
import Plans from './pages/Plans';
import MySubscription from './pages/MySubscription';
import History from './pages/History';
import NotFound from './pages/NotFound';
import Dashboard from './pages/admin/Dashboard';
import Movies from './pages/admin/Movies';
import MovieForm from './pages/admin/MovieForm';
import MovieAssets from './pages/admin/MovieAssets';
import Actors from './pages/admin/Actors';
import Directors from './pages/admin/Directors';
import Genres from './pages/admin/Genres';
import Users from './pages/admin/Users';
import PlansAdmin from './pages/admin/Plans';
import Subscriptions from './pages/admin/Subscriptions';
import AdminHistory from './pages/admin/AdminHistory';
import Payments from './pages/admin/Payments';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <ProfileProvider>
            <ToastProvider>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rutas protegidas - Selección de perfil */}
                <Route
                  path="/profiles"
                  element={
                    <ProtectedRoute>
                      <ProfileSelection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profiles/manage"
                  element={
                    <ProtectedRoute>
                      <ManageProfiles />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas protegidas - Contenido */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Home />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <History />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Rutas protegidas - Player */}
                <Route
                  path="/player/:movieId"
                  element={
                    <ProtectedRoute>
                      <Player />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas protegidas - Suscripciones */}
                <Route
                  path="/plans"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Plans />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MySubscription />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Rutas de administración */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Dashboard />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/movies"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Movies />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/movies/new"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <MovieForm />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/movies/:id/edit"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <MovieForm />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/movies/:id/assets"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <MovieAssets />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/actors"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Actors />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/directors"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Directors />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/genres"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Genres />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Users />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/plans"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <PlansAdmin />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/subscriptions"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Subscriptions />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/history"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminHistory />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Payments />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />

                {/* Redirección por defecto */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* 404 - Debe ser la última ruta */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ToastProvider>
          </ProfileProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
