// Stable Unsplash portrait/headshot-ish URLs
export const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop&crop=faces",
];

export function pickStableAvatar(seedString = "") {
  const s = String(seedString);
  let hash = 0;

  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }

  return AVATARS[hash % AVATARS.length];
}
