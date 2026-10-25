import type { ReactNode } from 'react';
import { ScrollRegion } from '../../ui/ScrollRegion';
export default function ScrollWrapper({ children, minWidth = 'min-w-[600px]' }: { children: ReactNode; minWidth?: string }) {
  return <ScrollRegion label="Data table" minWidth={minWidth}>{children}</ScrollRegion>;
}
