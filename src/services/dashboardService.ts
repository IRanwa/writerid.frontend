import api from './api';

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalDatasets: number;
  totalModels: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/v1/Dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}; 