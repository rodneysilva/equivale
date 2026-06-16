/* @refresh reload */
import { render } from 'solid-js/web';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { AuthProvider } from './store/auth';
import { ToastProvider } from './store/toast';
import './index.css';

registerSW({ immediate: true });

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

render(() => (
  <AuthProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AuthProvider>
), root);
