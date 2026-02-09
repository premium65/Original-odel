import { atom } from 'recoil';

// Define the structure of your booking data
export interface CalendarData {
  checkIn: {
    day: string;
    month: string;
    dayOfWeek: string;
    year: number;
  };
  checkOut: {
    day: string;
    month: string;
    dayOfWeek: string;
    year: number;
  };
  rooms: number;
  guests: number;
}

// Create a Recoil atom for booking data
export const calendarState = atom<CalendarData>({
  key: 'calendarState', // unique ID (with respect to other atoms/selectors)
  default: {
    checkIn: { day: '', month: '', dayOfWeek: '', year:0 },
    checkOut: { day: '', month: '', dayOfWeek: '', year:0 },
    rooms: 0,
    guests: 0,
  },
});
