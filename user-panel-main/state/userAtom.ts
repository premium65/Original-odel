// state/userAtom.ts
import { UserData } from '@/types/AccountDetails';
import { atom } from 'recoil';

export const userAtom = atom<UserData | null>({
  key: 'userAtom', // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});
