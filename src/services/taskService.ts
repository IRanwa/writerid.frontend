import api from './api';

export interface Task {
  id: string;
  name: string;
  description: string;
  datasetId: number;
  modelId: number;
  status: 'created' | 'processing' | 'executed' | 'failed';
  createdAt: string;
  updatedAt?: string;
  accuracy?: number;
  writerIdentified?: string;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  datasetId: string; // Guid as string
  selectedWriters: string[]; // List of writer IDs
  useDefaultModel: boolean;
  modelId?: string; // Optional Guid for custom models
  queryImageBase64: string; // Base64 encoded image
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
}

export interface Writer {
  writerId: string;
  writerName: string;
  sampleCount: number;
  confidence: number;
}

export interface DatasetAnalysisResponse {
  datasetId: string;
  datasetName: string;
  status: string;
  writers: Writer[];
  analyzedAt: string;
}

class TaskService {
  // Get all tasks
  async getTasks(): Promise<TasksResponse> {
    try {
      const response = await api.get('/api/v1/Tasks');
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      
      // Handle different possible response structures
      if (Array.isArray(response.data)) {
        // If the response is directly an array of tasks
        return {
          tasks: response.data,
          total: response.data.length
        };
      } else if (response.data && response.data.tasks) {
        // If the response has a tasks property
        return {
          tasks: response.data.tasks,
          total: response.data.total || response.data.tasks.length
        };
      } else if (response.data && Array.isArray(response.data.data)) {
        // If the response has a data property with tasks
        return {
          tasks: response.data.data,
          total: response.data.total || response.data.data.length
        };
      } else {
        // Empty response or unknown structure
        console.warn('Unexpected API response structure:', response.data);
        return {
          tasks: [],
          total: 0
        };
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(id: string): Promise<Task> {
    const response = await api.get(`/api/v1/Tasks/${id}`);
    return response.data;
  }

  // Create new task
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await api.post('/api/v1/Tasks', taskData);
    return response.data;
  }

  // Execute task
  async executeTask(id: string): Promise<void> {
    await api.post(`/api/v1/Tasks/${id}/execute`);
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/api/v1/Tasks/${id}`);
  }

  // Get dataset analysis (writers)
  async getDatasetAnalysis(datasetId: string): Promise<DatasetAnalysisResponse> {
    try {
      const response = await api.get(`/api/v1/Tasks/dataset/${datasetId}/analysis`);
      console.log('Dataset analysis response:', response.data);
      
      // The API returns the expected structure directly
      if (response.data && response.data.writers && Array.isArray(response.data.writers)) {
        return response.data;
      } else {
        console.warn('Unexpected dataset analysis response structure:', response.data);
        return {
          datasetId,
          datasetName: 'Unknown Dataset',
          status: 'Unknown',
          writers: [],
          analyzedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Error fetching dataset analysis:', error);
      throw error;
    }
  }
}

export default new TaskService(); 