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
  trainingDatasetName?: string;
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

export interface CreateModelRequest {
  name: string;
  trainingDatasetId: string;
}

export interface CreateModelResponse {
  id: string;
  name: string;
  trainingDatasetId: string;
  status: string;
  createdAt: string;
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

  // Create new model
  createModel: async (modelData: CreateModelRequest): Promise<CreateModelResponse> => {
    try {
      const response = await api.post('/api/v1/models', {
        name: modelData.name,
        trainingDatasetId: modelData.trainingDatasetId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  },

  // Delete model
  deleteModel: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/models/${id}`);
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  },
};

export default modelService; 