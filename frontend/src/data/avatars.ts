// 40 avatares com temática comunitária, descentralização, anarquismo, anticapitalismo
// Usa DiceBear API com diferentes estilos e seeds + paletas vermelho/preto

const styles = ['bottts', 'identicon', 'shapes', 'icons', 'thumbs'];
const seeds = [
  'solidarity', 'mutual-aid', 'commune', 'workers', 'union',
  'freedom', 'equality', 'commons', 'cooperative', 'collective',
  'resist', 'revolt', 'grassroots', 'assembly', 'syndicate',
  'autonomy', 'federation', 'direct-action', 'occupy', 'strike',
  'red-flag', 'black-red', 'circle-a', 'clenched-fist', 'raised-fist',
  'wheat-flower', 'sickle-hammer', 'venezia-angel', 'paris-commune',
  'zapata', 'durruti', 'kropotkin', 'bakunin', 'luxemburg',
  'malatesta', 'makhno', 'bookchin', 'chomsky', 'graeber',
];

export const AVATAR_GALLERY: string[] = seeds.map((seed, i) =>
  `https://api.dicebear.com/9.x/${styles[i % styles.length]}/svg?seed=${seed}&backgroundColor=dc2626,7c2d12,292524,18181b,991b1b,450a0a`
);

export const SOCIAL_LINK_TYPES = [
  { type: 'website', label: 'Site / Blog', icon: '🌐', placeholder: 'https://meusite.com' },
  { type: 'github', label: 'GitHub', icon: '🐙', placeholder: 'https://github.com/usuario' },
  { type: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/usuario' },
  { type: 'twitter', label: 'Twitter / X', icon: '🐦', placeholder: 'https://twitter.com/usuario' },
  { type: 'mastodon', label: 'Mastodon', icon: '🐘', placeholder: 'https://mastodon.social/@usuario' },
  { type: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/usuario' },
  { type: 'youtube', label: 'YouTube', icon: '▶️', placeholder: 'https://youtube.com/@canal' },
  { type: 'discord', label: 'Discord', icon: '🎮', placeholder: 'https://discord.gg/servidor' },
  { type: 'telegram', label: 'Telegram', icon: '✈️', placeholder: 'https://t.me/usuario' },
  { type: 'bluesky', label: 'Bluesky', icon: '🦋', placeholder: 'https://bsky.app/profile/usuario' },
];

export function getSocialLinkLabel(type: string): string {
  return SOCIAL_LINK_TYPES.find(s => s.type === type)?.label ?? type;
}

export function getSocialLinkIcon(type: string): string {
  return SOCIAL_LINK_TYPES.find(s => s.type === type)?.icon ?? '🔗';
}
