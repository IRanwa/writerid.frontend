import api from './api';

export interface Task {
  id: string;
  name: string;
  description: string;
  datasetId: number;
  modelId: number;
  modelName: string;
  datasetName: string;
  status: 0 | 1 | 2 | 3; // 0: Created, 1: Processing, 2: Completed, 3: Failed
  createdAt: string;
  updatedAt?: string;
  accuracy?: number;
  writerIdentified?: string;
  queryImageBase64?: string;
  selectedWriters?: string[]; // List of selected writer names from API
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
  writer_names: string[]; // The actual API response structure
  writers: Writer[]; // Transformed data for UI
  analyzedAt: string;
}

class TaskService {
  // Get all tasks
  async getTasks(): Promise<TasksResponse> {
    try {
      const response = await api.get('/api/v1/Tasks');
      
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

  // Get prediction results for completed task
  async getPredictionResults(id: string): Promise<any> {
    try {
      const response = await api.get(`/api/v1/Tasks/${id}/prediction`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction results:', error);
      throw error;
    }
  }

  // Get dataset analysis (writers)
  async getDatasetAnalysis(datasetId: string): Promise<DatasetAnalysisResponse> {
    try {
      const response = await api.get(`/api/v1/Tasks/dataset/${datasetId}/analysis`);
      
      // Handle the actual API response structure with writer_names
      if (response.data && response.data.writer_names && Array.isArray(response.data.writer_names)) {
        // Transform writer_names into Writer objects for UI compatibility
        const writers: Writer[] = response.data.writer_names.map((writerName: string, index: number) => ({
          writerId: `writer_${index + 1}`, // Generate a simple ID
          writerName: writerName,
          sampleCount: 0, // Default value since not provided by API
          confidence: 100, // Default value since not provided by API
        }));

        return {
          datasetId: response.data.datasetId || datasetId,
          datasetName: response.data.datasetName || 'Unknown Dataset',
          status: response.data.status || 'Unknown',
          writer_names: response.data.writer_names,
          writers: writers,
          analyzedAt: response.data.analyzedAt || new Date().toISOString(),
        };
      } else {
        console.warn('Unexpected dataset analysis response structure:', response.data);
        return {
          datasetId,
          datasetName: 'Unknown Dataset',
          status: 'Unknown',
          writer_names: [],
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