import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Model {
  id: string;
  name: string;
  description: string;
  algorithm: string;
  status: 'created' | 'training' | 'trained' | 'failed';
  accuracy?: number;
  createdAt: string;
  updatedAt: string;
  trainingProgress: number;
  hyperparameters: Record<string, any>;
  results?: any;
  datasetId: string;
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
  },
});

export const { 
  setModels, 
  addModel, 
  updateModel, 
  setCurrentModel, 
  setLoading, 
  setTraining, 
  setError 
} = modelsSlice.actions;
export default modelsSlice.reducer; 