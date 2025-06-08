import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalDatasets: number;
  totalModels: number;
  runningTasks: number;
}

interface RecentActivity {
  id: string;
  type: 'task' | 'dataset' | 'model';
  action: string;
  timestamp: string;
  status: 'success' | 'error' | 'processing';
}

interface DashboardState {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    totalDatasets: 0,
    totalModels: 0,
    runningTasks: 0,
  },
  recentActivity: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DashboardStats>) => {
      state.stats = action.payload;
    },
    setRecentActivity: (state, action: PayloadAction<RecentActivity[]>) => {
      state.recentActivity = action.payload;
    },
    addActivity: (state, action: PayloadAction<RecentActivity>) => {
      state.recentActivity.unshift(action.payload);
      // Keep only the last 10 activities
      state.recentActivity = state.recentActivity.slice(0, 10);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setStats, setRecentActivity, addActivity, setLoading, setError } = dashboardSlice.actions;
export default dashboardSlice.reducer; 