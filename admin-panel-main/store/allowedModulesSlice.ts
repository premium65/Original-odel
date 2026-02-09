import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AllowedModulesData {
    map(arg0: (module: any) => JSX.Element): unknown;
    _id: string;
    mainmoduleId: string;
    subModule: string;
  status: string;
}

interface AllowedModulesState {
  data?: AllowedModulesData;
  allowedLoading: boolean;
  allowedError?: string;
}

const initialState: AllowedModulesState = {
  allowedLoading: false,
  allowedError: undefined,
};

const allowedModulesSlice = createSlice({
  name: 'allowedModules',
  initialState,
  reducers: {
    fetchSubModulesStart(state) {
      state.allowedLoading = true;
      state.allowedError = undefined;
    },
    fetchSubModulesSuccess(state, action: PayloadAction<AllowedModulesData>) {
      state.allowedLoading = false;
      state.data = action.payload;
    },
    fetchSubModulesFailure(state, action: PayloadAction<string>) {
      state.allowedLoading = false;
      state.allowedError = action.payload;
    },
    clearSubModules(state) {
      state.data = undefined;
    },
  },
});

export const { fetchSubModulesStart, fetchSubModulesSuccess, fetchSubModulesFailure, clearSubModules } = allowedModulesSlice.actions;
export default allowedModulesSlice.reducer;
