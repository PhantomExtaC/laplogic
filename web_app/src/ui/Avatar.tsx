import { useState } from 'react';
import clsx from 'clsx';
export function Avatar({ src, name, className }: { src: string | null; name: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  return <div className={clsx('flex items-center justify-center overflow-hidden rounded-lg bg-obsidian', className)}>{src && failed !== src ? <img src={src} alt={name} loading="lazy" onError={() => setFailed(src)} className="h-full w-full object-contain" /> : <span role="img" aria-label={`${name} — image unavailable`} className="px-4 font-mono text-2xl text-text-muted">{name.split(' ').map(word => word[0]).slice(0, 3).join('')}</span>}</div>;
}
