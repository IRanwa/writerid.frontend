import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import modelService, { ModelResponse, CreateModelRequest } from '../../services/modelService';

export interface Model {
  id: string;
  name: string;
  description?: string;
  algorithm?: string;
  status: number; // Same as datasets: 0=Created, 1=Processing, 2=Completed, 3=Failed
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

interface ModelsState {
  models: Model[];
  currentModel: Model | null;
  loading: boolean;
  training: boolean;
  error: string | null;
}

const initialState: ModelsState = {
  models: [],
  currentModel: null,
  loading: false,
  training: false,
  error: null,
};

// Async thunk for fetching all models
export const fetchAllModels = createAsyncThunk(
  'models/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const models = await modelService.getAllModels();
      return models;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch models');
    }
  }
);

// Async thunk for fetching a single model
export const fetchModelById = createAsyncThunk(
  'models/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const model = await modelService.getModelById(id);
      return model;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch model');
    }
  }
);

// Async thunk for creating a new model
export const createModel = createAsyncThunk(
  'models/create',
  async (modelData: CreateModelRequest, { rejectWithValue }) => {
    try {
      const response = await modelService.createModel(modelData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create model');
    }
  }
);

// Async thunk for deleting a model
export const deleteModel = createAsyncThunk(
  'models/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await modelService.deleteModel(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete model');
    }
  }
);

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setModels: (state, action: PayloadAction<Model[]>) => {
      state.models = action.payload;
    },
    addModel: (state, action: PayloadAction<Model>) => {
      state.models.unshift(action.payload);
    },
    updateModel: (state, action: PayloadAction<{ id: string; updates: Partial<Model> }>) => {
      const index = state.models.findIndex(model => model.id === action.payload.id);
      if (index !== -1) {
        state.models[index] = { ...state.models[index], ...action.payload.updates };
      }
    },
    setCurrentModel: (state, action: PayloadAction<Model | null>) => {
      state.currentModel = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTraining: (state, action: PayloadAction<boolean>) => {
      state.training = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllModels
      .addCase(fetchAllModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllModels.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different API response structures
        const payload = action.payload as any;
        const modelsData = Array.isArray(payload) 
          ? payload 
          : (payload?.data || payload?.models || []);
        
        state.models = modelsData.map((model: ModelResponse) => {
          // Helper function to convert string status to numeric
          const convertStatus = (status: string | number | undefined): number => {
            if (typeof status === 'number') return status;
            if (!status || typeof status !== 'string') return 0; // Default to 'Created' if undefined
            switch (status.toLowerCase()) {
              case 'created': return 0;
              case 'processing':
              case 'training': return 1;
              case 'processed':
              case 'trained':
              case 'completed': return 2;
              case 'failed': return 3;
              default: return 0;
            }
          };

          return {
            ...model,
            description: model.description || '',
            algorithm: model.algorithm || '',
            updatedAt: model.updatedAt || model.createdAt,
            trainingProgress: model.trainingProgress || 0,
            hyperparameters: model.hyperparameters || {},
            datasetId: model.datasetId || '',
            trainingDatasetName: model.trainingDatasetName || model.trainedOn || 'Unknown Dataset',
            status: convertStatus(model.status)
          };
        });
        state.error = null;
      })
      .addCase(fetchAllModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetchModelById
      .addCase(fetchModelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModelById.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different API response structures
        const payload = action.payload as any;
        const modelData = payload?.data || payload;
        
        state.currentModel = {
          ...modelData,
          description: modelData.description || '',
          algorithm: modelData.algorithm || '',
          updatedAt: modelData.updatedAt || modelData.createdAt,
          trainingProgress: modelData.trainingProgress || 0,
          hyperparameters: modelData.hyperparameters || {},
          datasetId: modelData.datasetId || '',
          trainingDatasetName: modelData.trainingDatasetName || modelData.trainedOn || 'Unknown Dataset'
        };
        state.error = null;
      })
      .addCase(fetchModelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle createModel
      .addCase(createModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
             .addCase(createModel.fulfilled, (state, action) => {
         state.loading = false;
         state.error = null;
         // Handle different API response structures
         const payload = action.payload as any;
         const responseData = payload?.data || payload;
         
         // Helper function to convert string status to numeric
         const convertStatus = (status: string | number | undefined): number => {
           if (typeof status === 'number') return status;
           if (!status || typeof status !== 'string') return 0; // Default to 'Created' if undefined
           switch (status.toLowerCase()) {
             case 'created': return 0;
             case 'processing':
             case 'training': return 1;
             case 'processed':
             case 'trained':
             case 'completed': return 2;
             case 'failed': return 3;
             default: return 0;
           }
         };

         // Add the new model to the beginning of the list
         const newModel: Model = {
           id: responseData.id,
           name: responseData.name,
           description: '',
           algorithm: '',
           status: convertStatus(responseData.status),
           createdAt: responseData.createdAt,
           updatedAt: responseData.createdAt,
           trainingProgress: 0,
           hyperparameters: {},
           datasetId: responseData.trainingDatasetId,
         };
         state.models.unshift(newModel);
       })
             .addCase(createModel.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload as string;
       })
       // Handle deleteModel
       .addCase(deleteModel.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(deleteModel.fulfilled, (state, action) => {
         state.loading = false;
         state.error = null;
         // Remove the model from the list
         state.models = state.models.filter(model => model.id !== action.payload);
       })
       .addCase(deleteModel.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload as string;
       });
  },
});

export const { 
  setModels, 
  addModel, 
  updateModel, 
  setCurrentModel, 
  setLoading, 
  setTraining, 
  setError,
  clearError
} = modelsSlice.actions;
export default modelsSlice.reducer; 