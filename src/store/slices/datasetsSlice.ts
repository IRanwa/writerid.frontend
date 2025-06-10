import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import datasetService from '../../services/datasetService';
import type { Dataset, CreateDatasetRequest } from '../../services/datasetService';

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

// Async thunks
export const fetchDatasets = createAsyncThunk(
  'datasets/fetchDatasets',
  async (_, { rejectWithValue }) => {
    try {
      const datasets = await datasetService.getDatasets();
      return datasets;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch datasets');
    }
  }
);

export const createDataset = createAsyncThunk(
  'datasets/createDataset',
  async (datasetData: CreateDatasetRequest, { rejectWithValue }) => {
    try {
      const response = await datasetService.createDataset(datasetData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create dataset');
    }
  }
);

export const startAnalysis = createAsyncThunk(
  'datasets/startAnalysis',
  async (datasetId: string, { rejectWithValue }) => {
    try {
      await datasetService.startAnalysis(datasetId);
      return datasetId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to start analysis');
    }
  }
);

export const deleteDataset = createAsyncThunk(
  'datasets/deleteDataset',
  async (datasetId: string, { rejectWithValue }) => {
    try {
      await datasetService.deleteDataset(datasetId);
      return datasetId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete dataset');
    }
  }
);

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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch datasets
      .addCase(fetchDatasets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatasets.fulfilled, (state, action) => {
        state.loading = false;
        state.datasets = action.payload;
        state.error = null;
      })
      .addCase(fetchDatasets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create dataset
      .addCase(createDataset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDataset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Note: The actual dataset will be added when we refresh the list
      })
      .addCase(createDataset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Start analysis
      .addCase(startAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Update the dataset status to processing
        const index = state.datasets.findIndex(dataset => dataset.id === action.payload);
        if (index !== -1) {
          state.datasets[index].status = 1; // Processing
        }
      })
      .addCase(startAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete dataset
      .addCase(deleteDataset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDataset.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Remove the dataset from the list
        state.datasets = state.datasets.filter(dataset => dataset.id !== action.payload);
      })
      .addCase(deleteDataset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setDatasets, 
  addDataset, 
  updateDataset, 
  setCurrentDataset, 
  setLoading, 
  setUploading, 
  setError,
  clearError
} = datasetsSlice.actions;

export default datasetsSlice.reducer; 