import { atom } from 'recoil';

export const authState = atom({
  key: 'authState',
  default: false, // Default to not logged in
  effects_UNSTABLE: [
    ({ setSelf }) => {
      if (typeof window !== 'undefined') {
      // On page load, get the user token from local storage
      const savedValue = localStorage.getItem('userToken');
      const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

      if (savedValue || cookieToken) {
        setSelf(true); // Set the state to the saved value
      }
    }
    },
  ],
});