// state/userAtom.ts
import { SiteData } from '@/types/siteSettingDetails';
import { atom } from 'recoil';

export const siteSettingAtom = atom<SiteData | null>({
  key: 'siteSettingAtom', // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});
