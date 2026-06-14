import type { Component } from 'solid-js';
import { Shield, Users, Flag, BarChart3 } from 'lucide-solid';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'moderation', label: 'Moderação', icon: Flag },
  { id: 'users', label: 'Usuários', icon: Users },
];

const AdminSidebar: Component<AdminSidebarProps> = (props) => {
  return (
    <div class="glass-card p-4 w-full lg:w-64">
      <div class="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Shield size={20} class="text-indigo-500" />
        <h2 class="font-bold text-gray-900 dark:text-white">Admin</h2>
      </div>
      <nav class="space-y-1">
        {tabs.map(tab => (
          <button
            onClick={() => props.onTabChange(tab.id)}
            class={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              props.activeTab === tab.id
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
