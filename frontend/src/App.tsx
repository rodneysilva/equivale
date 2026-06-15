import { type Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import AdminPage from './pages/AdminPage';
import CreateProductPage from './pages/CreateProductPage';
import CreateServicePage from './pages/CreateServicePage';
import CreateCommunityPage from './pages/CreateCommunityPage';
import SearchPage from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import UsersListPage from './pages/UsersListPage';

const App: Component = () => {
  return (
    <Router root={(props) => (
      <div class="min-h-screen flex flex-col" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text)' }}>
        <Navbar />
        <main class="flex-1">
          {props.children}
        </main>
        <Footer />
      </div>
    )}>
      <Route path="/" component={HomePage} />
      <Route path="/communities" component={CommunitiesPage} />
      <Route path="/communities/:id" component={CommunityDetailPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/:id" component={ServiceDetailPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/products/new" component={CreateProductPage} />
      <Route path="/services/new" component={CreateServicePage} />
      <Route path="/communities/new" component={CreateCommunityPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/users" component={UsersListPage} />
      <Route path="/users/:id" component={UserProfilePage} />
    </Router>
  );
};

export default App;
