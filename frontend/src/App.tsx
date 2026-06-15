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
import CreateProductPage from './pages/CreateProductPage';
import CreateServicePage from './pages/CreateServicePage';
import CreateCommunityPage from './pages/CreateCommunityPage';
import SearchPage from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import UsersListPage from './pages/UsersListPage';
import CommunityProductsPage from './pages/CommunityProductsPage';
import CommunityServicesPage from './pages/CommunityServicesPage';
import CommunityMembersPage from './pages/CommunityMembersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import TransactionsPage from './pages/TransactionsPage';
import DashboardPage from './pages/DashboardPage';
import TransactionDetailPage from './pages/TransactionDetailPage';

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
      <Route path="/search" component={SearchPage} />
      {/* Products — "new" antes de ":id" */}
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/new" component={CreateProductPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      {/* Services — "new" antes de ":id" */}
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/new" component={CreateServicePage} />
      <Route path="/services/:id" component={ServiceDetailPage} />
      {/* Communities — "new" antes de ":id" */}
      <Route path="/communities" component={CommunitiesPage} />
      <Route path="/communities/new" component={CreateCommunityPage} />
      <Route path="/communities/:id" component={CommunityDetailPage} />
      <Route path="/communities/:id/products" component={CommunityProductsPage} />
      <Route path="/communities/:id/services" component={CommunityServicesPage} />
      <Route path="/communities/:id/members" component={CommunityMembersPage} />
      {/* Auth */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      {/* User */}
      <Route path="/users" component={UsersListPage} />
      <Route path="/users/:id" component={UserProfilePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/wallet" component={WalletPage} />
      {/* Transactions */}
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/transactions/:id" component={TransactionDetailPage} />
      {/* Admin */}
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
    </Router>
  );
};

export default App;
