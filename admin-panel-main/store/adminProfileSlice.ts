import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Google2FA {
  secret: string;
  uri: string;
}

interface AdminData {
    _id: string;
  name: string;
  adminInviteId: string;
  seqNo: number;
  email: string;
  password: string;
  phoneNumber?: number;
  conFirmMailToken: string;
  mailToken: string;
  otptime: Date;
  role?: 'superadmin' | 'admin' | 'subadmin';
  restriction?: any[];
  google2Fa: Google2FA;
  createdAt: Date;
}

interface AdminProfileState {
  data?: AdminData;
  loading: boolean;
  error?: string;
}

const initialState: AdminProfileState = {
  loading: false,
  error: undefined,
};

const adminProfileSlice = createSlice({
  name: 'adminProfile',
  initialState,
  reducers: {
    fetchProfileStart(state) {
      state.loading = true;
      state.error = undefined;
    },
    fetchProfileSuccess(state, action: PayloadAction<AdminData>) {
      state.loading = false;
      state.data = action.payload;
    },
    fetchProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearProfile(state) {
      state.data = undefined;
    },
  },
});

export const { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, clearProfile } = adminProfileSlice.actions;
export default adminProfileSlice.reducer;
