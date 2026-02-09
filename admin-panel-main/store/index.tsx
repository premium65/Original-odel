import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/themeConfigSlice';
import adminProfileReducer from './adminProfileSlice';
import allowedModulesReducer from './allowedModulesSlice'

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    adminProfile: adminProfileReducer,
    allowedModules: allowedModulesReducer,
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
