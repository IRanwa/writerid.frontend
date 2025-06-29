import api from './api';

export interface ModelResponse {
  id: string;
  name: string;
  description?: string;
  algorithm?: string;
  status: 'created' | 'training' | 'trained' | 'failed' | 'processed' | 'processing';
  accuracy?: number;
  createdAt: string;
  updatedAt?: string;
  trainingProgress?: number;
  hyperparameters?: Record<string, any>;
  results?: any;
  datasetId?: string;
  trainedOn?: string;
  performanceData?: {
    dataset_path: string;
    accuracy: number;
    f1_score: number;
    precision: number;
    recall: number;
    confusion_matrix: number[][];
    time: number;
    requested_episodes: number;
    actual_episodes_run: number;
    optimal_val_episode: number;
    best_val_accuracy: number;
    backbone: string;
    error: string | null;
  };
}

export const modelService = {
  // Get all models
  getAllModels: async (): Promise<ModelResponse[]> => {
    try {
      const response = await api.get('/api/v1/models');
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  // Get single model by ID
  getModelById: async (id: string): Promise<ModelResponse> => {
    try {
      const response = await api.get(`/api/v1/models/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw error;
    }
  },
};

export default modelService; 