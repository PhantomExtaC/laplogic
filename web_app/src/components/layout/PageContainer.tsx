import type { ReactNode } from 'react';
export default function PageContainer({ children }: { children: ReactNode }) { return <div className="page">{children}</div>; }
