import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import taskService, { Task, CreateTaskRequest, TasksResponse } from '../../services/taskService';

// Async thunks
export const fetchTasks = createAsyncThunk<TasksResponse>(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching tasks...');
      const result = await taskService.getTasks();
      console.log('Tasks fetched successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Error in fetchTasks thunk:', error);
      console.error('Error response:', error.response);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk<Task, CreateTaskRequest>(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      return await taskService.createTask(taskData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const executeTask = createAsyncThunk<string, string>(
  'tasks/executeTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskService.executeTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to execute task');
    }
  }
);

export const deleteTask = createAsyncThunk<string, string>(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);



interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  executing: boolean;
  total: number;
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  executing: false,
  total: 0,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Execute task
      .addCase(executeTask.pending, (state) => {
        state.executing = true;
        state.error = null;
      })
      .addCase(executeTask.fulfilled, (state, action) => {
        state.executing = false;
        const taskIndex = state.tasks.findIndex(task => task.id === action.payload);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].status = 1; // Set status to Processing (1)
        }
      })
      .addCase(executeTask.rejected, (state, action) => {
        state.executing = false;
        state.error = action.payload as string;
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.total -= 1;
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentTask, clearError } = tasksSlice.actions;
export default tasksSlice.reducer; 