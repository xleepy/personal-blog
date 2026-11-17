import { SkyDome } from './SkyDome';
import type { ComponentProps } from 'react';

export function Sky(props: ComponentProps<typeof SkyDome>) {
  return <SkyDome {...props} />;
}
