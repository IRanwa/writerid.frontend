import { configureStore } from '@reduxjs/toolkit';
import dashboardSlice from './slices/dashboardSlice';
import tasksSlice from './slices/tasksSlice';
import datasetsSlice from './slices/datasetsSlice';
import modelsSlice from './slices/modelsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice,
    tasks: tasksSlice,
    datasets: datasetsSlice,
    models: modelsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 