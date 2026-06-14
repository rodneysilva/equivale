import type { Component } from 'solid-js';
import { X } from 'lucide-solid';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  children: any;
}

const Sidebar: Component<SidebarProps> = (props) => {
  return (
    <>
      {props.open && (
        <div class="fixed inset-0 z-50 lg:hidden">
          <div class="absolute inset-0 bg-black/50" onClick={props.onClose} />
          <div class="absolute left-0 top-0 bottom-0 w-72 liquid-nav p-4 overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xl font-bold gradient-text">equivale</span>
              <button
                onClick={props.onClose}
                class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {props.children}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
