/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import { AuthProvider } from './store/auth';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

render(() => (
  <AuthProvider>
    <App />
  </AuthProvider>
), root);
