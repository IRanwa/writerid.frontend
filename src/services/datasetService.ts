import api from './api';

export interface Dataset {
  id: string;
  name: string;
  status: number; // ProcessingStatus enum: 0=Created, 1=Processing, 2=Completed, 3=Failed
  createdAt: string;
  updatedAt: string | null;
  fileCount?: number;
  fileSize?: number;
  sasUrl?: string;
  analysisResults?: any;
  uploadProgress?: number;
}

export interface CreateDatasetRequest {
  name: string;
}

export interface CreateDatasetResponse {
  id: string;
  name: string;
  sasUrl: string;
  status: string;
  createdAt: string;
}

export interface AnalysisRequest {
  datasetId: string;
}

export interface AnalysisResults {
  id: string;
  datasetId: string;
  status: string;
  results: any;
  completedAt?: string;
  error?: string;
}

const getDatasets = async (): Promise<Dataset[]> => {
  try {
    const response = await api.get('/api/v1/Datasets');
    console.log('Get datasets response:', response.data);
    return response.data || [];
  } catch (error: any) {
    console.error('Get datasets error:', error);
    throw error;
  }
};

const createDataset = async (datasetData: CreateDatasetRequest): Promise<CreateDatasetResponse> => {
  try {
    const response = await api.post('/api/v1/Datasets', datasetData);
    console.log('Create dataset response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Create dataset error:', error);
    throw error;
  }
};

const startAnalysis = async (datasetId: string): Promise<void> => {
  try {
    const response = await api.post(`/api/v1/Datasets/${datasetId}/analyze`);
    console.log('Start analysis response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Start analysis error:', error);
    throw error;
  }
};

const getAnalysisResults = async (datasetId: string): Promise<AnalysisResults> => {
  try {
    const response = await api.get(`/api/v1/Datasets/${datasetId}/analysis-results`);
    console.log('Get analysis results response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get analysis results error:', error);
    throw error;
  }
};

const deleteDataset = async (datasetId: string): Promise<void> => {
  try {
    const response = await api.delete(`/api/v1/Datasets/${datasetId}`);
    console.log('Delete dataset response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Delete dataset error:', error);
    throw error;
  }
};

const datasetService = {
  getDatasets,
  createDataset,
  startAnalysis,
  getAnalysisResults,
  deleteDataset,
};

export default datasetService; 