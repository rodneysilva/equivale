import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../store/auth';
import type { Transaction } from '../types';

const WalletPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [sending, setSending] = createSignal(false);
  const [recipientEmail, setRecipientEmail] = createSignal('');
  const [amount, setAmount] = createSignal('');
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');
  const [showSend, setShowSend] = createSignal(false);

  createEffect(() => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    loadTransactions();
  });

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser()?.id;
      if (userId) {
        const res = await fetch(`http://localhost:5000/api/transactions/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('eql_token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.map((tx: any) => ({
            id: tx.id,
            type: tx.transactionType?.toLowerCase() === 'transfer' ? 'transfer' : tx.transactionType?.toLowerCase() === 'bonus' ? 'bonus' : 'purchase',
            amount: tx.amount,
            description: tx.description,
            fromUserId: tx.fromUserId,
            toUserId: tx.toUserId,
            itemId: tx.relatedItemId,
            createdAt: tx.createdAt,
          })));
        }
      }
    } finally { setLoading(false); }
  };

  const handleSend = async (e: Event) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amt = parseFloat(amount());
    if (!recipientEmail() || isNaN(amt) || amt <= 0) { setError('Preencha todos os campos'); return; }
    setSending(true);
    try {
      setSuccess(`${amt} EQL enviado com sucesso`);
      setRecipientEmail('');
      setAmount('');
      setShowSend(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message || 'Erro ao enviar'); }
    finally { setSending(false); }
  };

  const balance = () => auth.currentUser()?.walletBalance || 0;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Carteira</h1>

      {success() && (
        <div class="mb-4 p-2.5 rounded text-xs" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>{success()}</div>
      )}

      {/* Balance */}
      <Card class="p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>Saldo</p>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-3xl font-bold eq-accent">{balance()}</span>
              <span class="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>EQL</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded eq-card flex items-center justify-center">
            <WalletIcon size={20} class="eq-brand" />
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowSend(!showSend())}>
            <ArrowUpRight size={14} class="mr-1.5" /> Enviar
          </Button>
          <Button size="sm" variant="ghost">
            <RefreshCw size={14} class="mr-1.5" /> Histórico
          </Button>
        </div>
      </Card>

      {/* Send form */}
      {showSend() && (
        <Card class="p-5 mb-6">
          <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Enviar EQL</h3>
          <form onSubmit={handleSend} class="space-y-3">
            {error() && (
              <div class="p-2.5 rounded text-xs" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error()}</div>
            )}
            <input
              type="email"
              value={recipientEmail()}
              onInput={(e) => setRecipientEmail(e.currentTarget.value)}
              placeholder="E-mail do destinatário"
              required
              class="eq-input"
            />
            <div class="relative">
              <input
                type="number"
                step="0.01"
                value={amount()}
                onInput={(e) => setAmount(e.currentTarget.value)}
                placeholder="Quantidade"
                required
                class="eq-input pr-10"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>EQL</span>
            </div>
            <div class="flex gap-2">
              <Button type="submit" size="sm" disabled={sending()}>
                {sending() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : 'Enviar'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowSend(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Transactions */}
      <Card class="p-5">
        <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Transações recentes</h3>
        {loading() ? (
          <LoadingSpinner class="py-8" />
        ) : transactions().length === 0 ? (
          <p class="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>Nenhuma transação registrada</p>
        ) : (
          <div class="space-y-2">
            {transactions().map(tx => (
              <div class="flex items-center justify-between p-2.5 rounded" style={{ background: 'var(--color-surface-alt)' }}>
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded flex items-center justify-center" style={{ background: (tx.type === 'sale' || tx.type === 'bonus') ? '#f0fdf4' : '#fef2f2' }}>
                    {(tx.type === 'sale' || tx.type === 'bonus') ? <ArrowDownLeft size={14} style={{ color: '#166534' }} /> : <ArrowUpRight size={14} style={{ color: '#991b1b' }} />}
                  </div>
                  <div>
                    <p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tx.description}</p>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <span class={`text-sm font-bold ${(tx.type === 'sale' || tx.type === 'bonus') ? 'text-green-700' : 'text-red-700'}`}>
                  {(tx.type === 'sale' || tx.type === 'bonus') ? '+' : '-'}{tx.amount} EQL
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WalletPage;
