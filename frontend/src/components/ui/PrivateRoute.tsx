import { type Component, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { useAuth } from '../../store/auth';

const PrivateRoute: Component<{ children: any }> = (props) => {
  const auth = useAuth();

  return (
    <Show when={!auth.isLoading()} fallback={<div class="py-20 flex items-center justify-center"><div class="eq-spinner w-8 h-8" /></div>}>
      <Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
        {props.children}
      </Show>
    </Show>
  );
};

export default PrivateRoute;
