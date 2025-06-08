import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  type: 'file' | 'sas_url';
  status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'failed';
  size: number;
  createdAt: string;
  updatedAt: string;
  analysisResults?: any;
  sasUrl?: string;
  fileName?: string;
}

interface DatasetsState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: DatasetsState = {
  datasets: [],
  currentDataset: null,
  loading: false,
  uploading: false,
  error: null,
};

const datasetsSlice = createSlice({
  name: 'datasets',
  initialState,
  reducers: {
    setDatasets: (state, action: PayloadAction<Dataset[]>) => {
      state.datasets = action.payload;
    },
    addDataset: (state, action: PayloadAction<Dataset>) => {
      state.datasets.unshift(action.payload);
    },
    updateDataset: (state, action: PayloadAction<{ id: string; updates: Partial<Dataset> }>) => {
      const index = state.datasets.findIndex(dataset => dataset.id === action.payload.id);
      if (index !== -1) {
        state.datasets[index] = { ...state.datasets[index], ...action.payload.updates };
      }
    },
    setCurrentDataset: (state, action: PayloadAction<Dataset | null>) => {
      state.currentDataset = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setDatasets, 
  addDataset, 
  updateDataset, 
  setCurrentDataset, 
  setLoading, 
  setUploading, 
  setError 
} = datasetsSlice.actions;
export default datasetsSlice.reducer; 