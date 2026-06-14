/* @refresh reload */
import { type Component } from 'solid-js';
import { Router, Route, Navigate } from '@solidjs/router';
import { AuthProvider } from './store/auth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import AdminPage from './pages/AdminPage';

const App: Component = () => {
  return (
    <Router root={(props) => (
      <AuthProvider>
        <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar />
          <main class="flex-1">
            {props.children}
          </main>
          <Footer />
        </div>
      </AuthProvider>
    )}>
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/:id" component={ServiceDetailPage} />
      <Route path="/communities" component={CommunitiesPage} />
      <Route path="/communities/:id" component={CommunityDetailPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="*" component={() => <Navigate href="/" />} />
    </Router>
  );
};

export default App;
