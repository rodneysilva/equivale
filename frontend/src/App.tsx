import { type Component, lazy, Suspense } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage'));
const CommunityDetailPage = lazy(() => import('./pages/CommunityDetailPage'));
const CommunityProductsPage = lazy(() => import('./pages/CommunityProductsPage'));
const CommunityServicesPage = lazy(() => import('./pages/CommunityServicesPage'));
const CommunityMembersPage = lazy(() => import('./pages/CommunityMembersPage'));
const CreateCommunityPage = lazy(() => import('./pages/CreateCommunityPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CreateProductPage = lazy(() => import('./pages/CreateProductPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const CreateServicePage = lazy(() => import('./pages/CreateServicePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const UsersListPage = lazy(() => import('./pages/UsersListPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const TransactionDetailPage = lazy(() => import('./pages/TransactionDetailPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCommunitiesPage = lazy(() => import('./pages/admin/AdminCommunitiesPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'));
const AdminTransactionsPage = lazy(() => import('./pages/admin/AdminTransactionsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const PageLoader = () => (
  <div class="py-20">
    <LoadingSpinner />
  </div>
);

const App: Component = () => {
  return (
    <Router root={(props) => (
      <div class="min-h-screen flex flex-col eq-bg" style={{ color: 'var(--color-text)' }}>
        <Navbar />
        <main class="flex-1">
          <Suspense fallback={<PageLoader />}>
            {props.children}
          </Suspense>
        </main>
        <Footer />
      </div>
    )}>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/new" component={CreateProductPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/new" component={CreateServicePage} />
      <Route path="/services/:id" component={ServiceDetailPage} />
      <Route path="/communities" component={CommunitiesPage} />
      <Route path="/communities/new" component={CreateCommunityPage} />
      <Route path="/communities/:id" component={CommunityDetailPage} />
      <Route path="/communities/:id/products" component={CommunityProductsPage} />
      <Route path="/communities/:id/services" component={CommunityServicesPage} />
      <Route path="/communities/:id/members" component={CommunityMembersPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/users" component={UsersListPage} />
      <Route path="/users/:id" component={UserProfilePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/transactions/:id" component={TransactionDetailPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/communities" component={AdminCommunitiesPage} />
      <Route path="/admin/services" component={AdminServicesPage} />
      <Route path="/admin/transactions" component={AdminTransactionsPage} />
      <Route path="/notifications" component={NotificationsPage} />
    </Router>
  );
};

export default App;
