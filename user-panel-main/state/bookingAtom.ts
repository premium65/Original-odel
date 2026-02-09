// state/userAtom.ts
import { BookingData } from '@/types/BookingDetails';
import { atom } from 'recoil';

export const bookingAtom = atom<BookingData | null>({
  key: 'bookingAtom', // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});
