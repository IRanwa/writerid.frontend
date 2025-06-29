import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import modelService, { ModelResponse } from '../../services/modelService';

export interface Model {
  id: string;
  name: string;
  description: string;
  algorithm: string;
  status: 'created' | 'training' | 'trained' | 'failed' | 'processed' | 'processing';
  accuracy?: number;
  createdAt: string;
  updatedAt: string;
  trainingProgress: number;
  hyperparameters: Record<string, any>;
  results?: any;
  datasetId: string;
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
        state.models = action.payload;
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
        state.currentModel = action.payload;
        state.error = null;
      })
      .addCase(fetchModelById.rejected, (state, action) => {
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