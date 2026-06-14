import type { Component } from 'solid-js';
import { Check, X } from 'lucide-solid';
import type { ModerationItem } from '../../types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import LiquidButton from '../ui/LiquidButton';

interface ModerationQueueProps {
  items: ModerationItem[];
  isLoading?: boolean;
  onApprove: (id: string, type: string) => void;
  onReject: (id: string, type: string) => void;
}

const ModerationQueue: Component<ModerationQueueProps> = (props) => {
  if (props.isLoading) {
    return (
      <div class="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div class="glass-card p-4 animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!props.items || props.items.length === 0) {
    return (
      <GlassCard class="p-8 text-center text-gray-500 dark:text-gray-400">
        Nenhum item pendente de moderação
      </GlassCard>
    );
  }

  return (
    <div class="space-y-3">
      {props.items.map(item => (
        <GlassCard class="p-4">
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <Badge variant={item.type === 'product' ? 'info' : 'warning'}>
                  {item.type === 'product' ? 'Produto' : 'Serviço'}
                </Badge>
                <h4 class="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
              <p class="text-xs text-gray-400 mt-2">
                Por {item.submittedByName || item.submittedById} · {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                onClick={() => props.onApprove(item.id, item.type)}
                class="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => props.onReject(item.id, item.type)}
                class="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default ModerationQueue;
