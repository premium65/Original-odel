// state/userAtom.ts
import { WalletData } from '@/types/walletDetails';
import { atom } from 'recoil';

export const walletAtom = atom<WalletData | null>({
  key: 'walletAtom', // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});
