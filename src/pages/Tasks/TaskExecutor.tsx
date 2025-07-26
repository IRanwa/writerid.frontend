import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, Dropdown, Space, Radio, Modal, Descriptions, Alert, Select, Transfer, Upload, Form, message, Spin, Input } from 'antd';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PlusOutlined, 
  MoreOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'antd/es/table/interface';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTasks, createTask, executeTask, deleteTask, setCurrentTask, clearError } from '../../store/slices/tasksSlice';
import { fetchDatasets } from '../../store/slices/datasetsSlice';
import { fetchAllModels, Model } from '../../store/slices/modelsSlice';
import { Task, Writer } from '../../services/taskService';
import taskService from '../../services/taskService';

interface WriterItem {
  key: string;
  title: string;
  description: string;
}

interface PredictionResults {
  task_id: string;
  query_image: string;
  query_image_base64: string;
  prediction: {
    writer_id: string;
    confidence: number;
  };
}

const TaskExecutor: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error, executing, total } = useSelector((state: RootState) => state.tasks);
  const { datasets } = useSelector((state: RootState) => state.datasets);
  const { models, loading: modelsLoading } = useSelector((state: RootState) => state.models);
  
  const [selectedTaskKey, setSelectedTaskKey] = useState<React.Key | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskForm] = Form.useForm();

  // Writers data state
  const [writers, setWriters] = useState<Writer[]>([]);
  const [writersLoading, setWritersLoading] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  // Model selection state
  const [useDefaultModel, setUseDefaultModel] = useState(true);

  // Task execution loading state
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  
  // Task creation loading state
  const [creatingTask, setCreatingTask] = useState(false);

  // Task details state
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);
  const [loadingTaskDetails, setLoadingTaskDetails] = useState(false);

  // Prediction results state
  const [predictionResults, setPredictionResults] = useState<PredictionResults | null>(null);
  const [loadingPredictionResults, setLoadingPredictionResults] = useState(false);

  // Query image state
  const [queryImageBase64, setQueryImageBase64] = useState<string>('');
  const [queryImageFile, setQueryImageFile] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Writers transfer data (legacy - will be replaced by real data)
  const [writersData] = useState<WriterItem[]>([]);
  const [selectedWriters, setSelectedWriters] = useState<Key[]>(['6']);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  // Fetch tasks on component mount
  useEffect(() => {
    console.log('TaskExecutor: Dispatching fetchTasks...');
    dispatch(fetchTasks());
  }, [dispatch]);

  // Auto-open modal when navigated from Dashboard
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsCreateTaskModalOpen(true);
      // Fetch datasets and models when modal opens from navigation
      dispatch(fetchDatasets());
      dispatch(fetchAllModels());
    }
  }, [location, dispatch]);

  // Show error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Debug logging for Redux state changes
  useEffect(() => {
    console.log('TaskExecutor Redux state updated:', {
      tasksCount: tasks.length,
      tasks,
      loading,
      error,
      total
    });
  }, [tasks, loading, error, total]);

  // Debug logging for writers state changes
  useEffect(() => {
    console.log('Writers state changed:', {
      writersCount: writers.length,
      writers,
      selectedDatasetId,
      writersLoading
    });
  }, [writers, selectedDatasetId, writersLoading]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: // Created
        return 'default';
      case 1: // Processing
        return 'processing';
      case 2: // Completed
        return 'success';
      case 3: // Failed
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Created';
      case 1:
        return 'Processing';
      case 2:
        return 'Completed';
      case 3:
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  // Get selected task data
  const getSelectedTask = (): Task | undefined => {
    return tasks.find(task => task.id === selectedTaskKey);
  };

  // Generate dynamic action items based on selected task status
  const getActionItems = () => {
    const selectedTask = getSelectedTask();
    if (!selectedTask) return [];

    const items: any[] = [
      {
        key: 'details',
        label: 'View Details',
        icon: <InfoCircleOutlined />,
        disabled: false,
      }
    ];

    // Add status-specific actions
    if (selectedTask.status === 2) { // Completed
      items.push({
        key: 'results',
        label: 'View Results',
        icon: <EyeOutlined />,
        disabled: false,
      });
      items.push({
        key: 'retry',
        label: executingTaskId === selectedTask.id ? 'Retrying...' : 'Retry Task',
        icon: <ReloadOutlined spin={executingTaskId === selectedTask.id} />,
        disabled: executingTaskId === selectedTask.id,
      });
      items.push({
        key: 'remove',
        label: 'Remove Task',
        icon: <DeleteOutlined />,
        disabled: false,
        danger: true,
      });
    } else if (selectedTask.status === 3) { // Failed
      items.push({
        key: 'retry',
        label: executingTaskId === selectedTask.id ? 'Retrying...' : 'Retry Task',
        icon: <ReloadOutlined spin={executingTaskId === selectedTask.id} />,
        disabled: executingTaskId === selectedTask.id,
      });
      items.push({
        key: 'remove',
        label: 'Remove Task',
        icon: <DeleteOutlined />,
        disabled: false,
        danger: true,
      });
    } else if (selectedTask.status === 0) { // Created
      items.push({
        key: 'execute',
        label: executingTaskId === selectedTask.id ? 'Executing...' : 'Execute Task',
        icon: <ReloadOutlined spin={executingTaskId === selectedTask.id} />,
        disabled: executingTaskId === selectedTask.id,
      });
      items.push({
        key: 'remove',
        label: 'Remove Task',
        icon: <DeleteOutlined />,
        disabled: false,
        danger: true,
      });
    }

    return items;
  };

  // Handle remove task confirmation
  const handleRemoveTask = async () => {
    const selectedTask = getSelectedTask();
    if (selectedTask) {
      try {
        await dispatch(deleteTask(selectedTask.id)).unwrap();
        message.success('Task removed successfully!');
        setIsRemoveConfirmOpen(false);
        setSelectedTaskKey(null);
      } catch (err) {
        // Error handled by useEffect
      }
    }
  };

  // Handle execute task
  const handleExecuteTask = async (taskId: string) => {
    try {
      setExecutingTaskId(taskId);
      await dispatch(executeTask(taskId)).unwrap();
      message.success('Task Execution Completed!');
      
      // Refresh tasks to get updated status
      const updatedTasksResult = await dispatch(fetchTasks()).unwrap();
      console.log('Grid refreshed after task execution:', updatedTasksResult);
      
      // Auto-open results modal for executed task when "Task Execution Completed!" is shown
      console.log('Auto-opening results modal for executed task:', taskId);
      setSelectedTaskKey(taskId);
      setIsResultsModalOpen(true);
      fetchPredictionResults(taskId);
    } catch (err) {
      // Error handled by useEffect
    } finally {
      setExecutingTaskId(null);
    }
  };

  // Fetch task details by ID for modal display
  const fetchTaskDetails = async (taskId: string) => {
    try {
      setLoadingTaskDetails(true);
      console.log('Fetching task details for:', taskId);
      const taskDetails = await taskService.getTaskById(taskId);
      console.log('Task details fetched:', taskDetails);
      setDetailedTask(taskDetails);
    } catch (error: any) {
      console.error('Error fetching task details:', error);
      message.error(error.response?.data?.message || 'Failed to fetch task details');
      setDetailedTask(null);
    } finally {
      setLoadingTaskDetails(false);
    }
  };

  // Fetch prediction results for completed task
  const fetchPredictionResults = async (taskId: string) => {
    try {
      setLoadingPredictionResults(true);
      console.log('Fetching prediction results for:', taskId);
      const results = await taskService.getPredictionResults(taskId);
      console.log('Prediction results fetched:', results);
      setPredictionResults(results);
    } catch (error: any) {
      console.error('Error fetching prediction results:', error);
      message.error(error.response?.data?.message || 'Failed to fetch prediction results');
      setPredictionResults(null);
    } finally {
      setLoadingPredictionResults(false);
    }
  };

  // Handle writers transfer
  const handleWritersChange = (targetKeys: Key[]) => {
    setSelectedWriters(targetKeys);
  };

  // Handle writers selection
  const handleWritersSelectChange = (sourceSelectedKeys: Key[], targetSelectedKeys: Key[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  // Handle create task form submission
  const handleCreateTask = async () => {
    // Manual validation for writers selection
    if (selectedWriters.length < 5) {
      message.error('Please select at least 5 writers!');
      return;
    }

    if (!selectedDatasetId) {
      message.error('Please select a dataset first!');
      return;
    }

    if (!queryImageBase64) {
      message.error('Please upload a query image!');
      return;
    }

    try {
      const values = await createTaskForm.validateFields();
      
      // Find the selected dataset name for better task description
      const selectedDataset = completedDatasets.find(d => d.id === values.dataset);
      const selectedWriterNames = selectedWriters as string[]; // selectedWriters now contains writer names
      
      console.log('Selected writers (names):', selectedWriters);
      console.log('Selected writer names:', selectedWriterNames);
      console.log('Available writers:', writers);
      console.log('Query image base64 length:', queryImageBase64.length);
      
      const taskData = {
        name: values.name || `Task for ${selectedDataset?.name || 'Selected Dataset'}`,
        description: values.description || `Task created with writers: ${selectedWriterNames.join(', ')} for dataset: ${selectedDataset?.name || 'Unknown'}`,
        datasetId: values.dataset, // Send as string (Guid)
        selectedWriters: selectedWriterNames, // Array of writer names (not IDs)
        useDefaultModel: useDefaultModel,
        modelId: useDefaultModel ? undefined : values.modelId,
        queryImageBase64: queryImageBase64, // Base64 encoded image
      };

      // Close modal immediately
      setIsCreateTaskModalOpen(false);
      createTaskForm.resetFields();
      setSelectedWriters([]);
      setSelectedKeys([]);
      setSelectedDatasetId(null);
      setWriters([]);
      setQueryImageBase64('');
      setQueryImageFile(null);
      setUseDefaultModel(true);
      
      // Set creating task loading state
      setCreatingTask(true);

      // Create task in background
      const createdTaskResponse = await dispatch(createTask(taskData)).unwrap();
      console.log('Task created successfully:', createdTaskResponse);
      
      // Show success message (same as retry)
      message.success('Task Execution Completed!');
      
      // Refresh the tasks grid to get latest task status
      const updatedTasksResult = await dispatch(fetchTasks()).unwrap();
      console.log('Grid refreshed after task creation:', updatedTasksResult);
      
      // Auto-open results modal for newly created task (should be the first task after refresh)
      if (updatedTasksResult.tasks.length > 0) {
        const newestTask = updatedTasksResult.tasks[0]; // First task should be the newest after refresh
        console.log('Auto-opening results modal for newest task:', newestTask.id);
        setSelectedTaskKey(newestTask.id);
        setIsResultsModalOpen(true);
        fetchPredictionResults(newestTask.id);
      }
    } catch (errorInfo) {
      console.log('Task creation failed:', errorInfo);
      
      // Show error message
      message.error('Task creation failed. Please try again.');
      
      // Refresh the tasks grid anyway to show current state
      dispatch(fetchTasks());
    } finally {
      setCreatingTask(false);
    }
  };

  // Handle create task modal close
  const handleCreateTaskModalClose = () => {
    setIsCreateTaskModalOpen(false);
    createTaskForm.resetFields();
    setSelectedWriters([]);
    setSelectedKeys([]);
    setSelectedDatasetId(null);
    setWriters([]);
    setQueryImageBase64('');
    setQueryImageFile(null);
    setUseDefaultModel(true);
  };

  // Handle opening create task modal and fetch datasets
  const handleOpenCreateTaskModal = () => {
    setIsCreateTaskModalOpen(true);
    // Fetch datasets and models when modal opens
    dispatch(fetchDatasets());
    dispatch(fetchAllModels());
  };

  // Handle model type change
  const handleModelTypeChange = (e: any) => {
    const useDefault = e.target.value;
    setUseDefaultModel(useDefault);
    
    if (useDefault) {
      createTaskForm.setFieldsValue({ modelId: undefined });
    }
  };

  // Get completed datasets only (status = 2)
  const completedDatasets = datasets.filter(dataset => dataset.status === 2);

  // Fetch writers for selected dataset
  const fetchWritersForDataset = async (datasetId: string) => {
    try {
      setWritersLoading(true);
      setSelectedDatasetId(datasetId);
      console.log('Fetching writers for dataset:', datasetId);
      
      const analysisData = await taskService.getDatasetAnalysis(datasetId);
      console.log('Dataset analysis response:', analysisData);
      console.log('Writers from API:', analysisData.writers);
      
      setWriters(analysisData.writers || []);
      
      // Reset writer selection when dataset changes
      setSelectedWriters([]);
      setSelectedKeys([]);
      
      console.log('Writers state updated, length:', analysisData.writers?.length || 0);
    } catch (error: any) {
      console.error('Error fetching writers:', error);
      console.error('Error details:', error.response?.data);
      message.error(error.response?.data?.message || 'Failed to fetch writers for dataset');
      setWriters([]);
    } finally {
      setWritersLoading(false);
    }
  };

  // Handle dataset selection change
  const handleDatasetChange = (datasetId: string) => {
    if (datasetId && datasetId !== selectedDatasetId) {
      fetchWritersForDataset(datasetId);
    }
  };

  // Convert writers to transfer format
  const getWritersTransferData = (): WriterItem[] => {
    console.log('getWritersTransferData called, writers state:', writers);
    const transferData = writers.map(writer => ({
      key: writer.writerName, // Use writer name as key since API expects writer names
      title: writer.writerName,
      description: writer.writerName,
    }));
    console.log('Transfer data generated:', transferData);
    return transferData;
  };

  // Convert image file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      const base64 = await convertToBase64(file);
      setQueryImageBase64(base64);
      setQueryImageFile(file);
    } catch (error) {
      message.error('Failed to process image. Please try again.');
      console.error('Image conversion error:', error);
    }
  };

  const columns: ColumnsType<Task> = [
    {
      title: '',
      dataIndex: 'select',
      width: 50,
      render: (_, record) => (
        <Radio
          checked={selectedTaskKey === record.id}
          onChange={() => {
            setSelectedTaskKey(record.id);
          }}
        />
      ),
    },
    {
      title: 'Task ID',
      dataIndex: 'id',
      key: 'id',
      width: 300,
      render: (text) => (
        <span className="task-id">{text}</span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <span className="dataset-name">{text}</span>
      ),
    },
    {
      title: 'Dataset',
      dataIndex: 'datasetName',
      key: 'datasetName',
      render: (text) => (
        <span className="dataset-name">{text}</span>
      ),
    },
    {
      title: 'Model',
      dataIndex: 'modelName',
      key: 'modelName',
      render: (text) => (
        <span className="model-name">{text}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Modified At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => text ? new Date(text).toLocaleString() : 'N/A',
    },
  ];

  const handleActionClick = ({ key }: { key: string }) => {
    const selectedTask = getSelectedTask();
    console.log(`Action clicked: ${key}`, selectedTask);
    
    // Handle different actions
    switch (key) {
      case 'execute':
        if (selectedTask) {
          handleExecuteTask(selectedTask.id);
        }
        break;
      case 'retry':
        if (selectedTask) {
          handleExecuteTask(selectedTask.id);
        }
        break;
      case 'remove':
        setIsRemoveConfirmOpen(true);
        break;
      case 'results':
        if (selectedTask) {
          setIsResultsModalOpen(true);
          fetchPredictionResults(selectedTask.id);
        }
        break;
      case 'details':
        if (selectedTask) {
          setIsDetailsModalOpen(true);
          fetchTaskDetails(selectedTask.id);
        }
        break;
      default:
        break;
    }
  };

  const selectedTask = getSelectedTask();

  if (loading && tasks.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading tasks...</div>
      </div>
    );
  }

  return (
    <Spin spinning={executingTaskId !== null}>
      <div style={{ padding: '0' }}>
        {/* Header Section */}
        <div className="flex-row-between">
          <h1 className="page-title">Task Executor</h1>
          <div className="header-actions">
            <Dropdown
              menu={{
                items: getActionItems(),
                onClick: handleActionClick,
              }}
              placement="bottomRight"
              disabled={!selectedTaskKey || executingTaskId !== null}
            >
              <Button disabled={executing || executingTaskId !== null}>
                <Space>
                  Actions
                  <MoreOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              className="create-task-button"
              onClick={handleOpenCreateTaskModal}
              loading={loading}
              disabled={executingTaskId !== null}
            >
              Create Task
            </Button>
          </div>
        </div>

      {/* Task Table */}
      <div className="task-table-container">
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (totalItems, range) =>
              `${range[0]}-${range[1]} of ${totalItems} tasks`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
            onShowSizeChange: (current, size) => {
              setCurrentPage(1); // Reset to first page when changing page size
              setPageSize(size);
            },
          }}
          className="task-table"
          size="middle"
          rowKey="id"
        />
      </div>

      {/* Create Task Modal */}
      <Modal
        title="Create Task"
        open={isCreateTaskModalOpen}
        onCancel={handleCreateTaskModalClose}
        footer={[
          <Button key="close" onClick={handleCreateTaskModalClose}>
            Close
          </Button>,
          <Button 
            key="execute" 
            type="primary" 
            onClick={handleCreateTask}
            loading={creatingTask}
            disabled={creatingTask}
            icon={creatingTask ? <ReloadOutlined spin /> : undefined}
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          >
            {creatingTask ? 'Creating...' : 'Execute'}
          </Button>
        ]}
        width={800}
        maskClosable={false}
      >
        <Form
          form={createTaskForm}
          layout="vertical"
          style={{ marginTop: '20px' }}
          initialValues={{
            useDefaultModel: true
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#000000d9',
              fontSize: '14px'
            }}>
              <span style={{ color: '#ff4d4f' }}>*</span> Task Name
            </label>
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter a task name!' }]}
              style={{ marginBottom: 0 }}
            >
              <Input 
                placeholder="Enter task name" 
                size="large"
                maxLength={100}
              />
            </Form.Item>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#000000d9',
              fontSize: '14px'
            }}>
              <span style={{ color: '#ff4d4f' }}>*</span> Dataset
            </label>
            <div style={{ marginBottom: '8px', color: '#666', fontSize: '12px' }}>
              Only completed datasets are available for task creation
            </div>
            <Form.Item
              name="dataset"
              rules={[{ required: true, message: 'Please select a dataset!' }]}
              style={{ marginBottom: 0 }}
            >
              <Select 
                placeholder={completedDatasets.length > 0 ? "Select a dataset" : "No completed datasets available"} 
                size="large"
                disabled={completedDatasets.length === 0}
                notFoundContent={completedDatasets.length === 0 ? "No completed datasets found" : "No datasets found"}
                onChange={handleDatasetChange}
                allowClear
              >
                {completedDatasets.map(dataset => (
                  <Select.Option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#000000d9',
              fontSize: '14px'
            }}>
              <span style={{ color: '#ff4d4f' }}>*</span> Model Selection
            </label>
            <div style={{ marginBottom: '16px' }}>
              <Form.Item
                name="useDefaultModel"
                style={{ marginBottom: 0 }}
              >
                <Radio.Group onChange={handleModelTypeChange} value={useDefaultModel}>
                  <Space direction="vertical">
                    <Radio value={true}>Use Default Model</Radio>
                    <Radio value={false}>Use Custom Trained Model</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </div>
            {!useDefaultModel && (
              <Form.Item
                name="modelId"
                rules={[{ required: !useDefaultModel, message: 'Please select a model!' }]}
                style={{ marginBottom: 0 }}
              >
                <Select 
                  placeholder={modelsLoading ? "Loading models..." : models.filter((model: Model) => model.status === 2).length > 0 ? "Select a trained model" : "No trained models available"}
                  size="large"
                  loading={modelsLoading}
                  disabled={modelsLoading || models.filter((model: Model) => model.status === 2).length === 0}
                  notFoundContent={modelsLoading ? "Loading models..." : "No trained models found"}
                  allowClear
                  suffixIcon={<ExperimentOutlined />}
                >
                  {models.filter((model: Model) => model.status === 2).map(model => (
                    <Select.Option key={model.id} value={model.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{model.name}</span>
                        {model.accuracy && (
                          <span style={{ color: '#666', fontSize: '12px' }}>
                            {`${(model.accuracy * 100).toFixed(1)}%`}
                          </span>
                        )}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {!useDefaultModel && models.filter((model: Model) => model.status === 2).length === 0 && !modelsLoading && (
              <Alert
                message="No trained models available"
                description="Please train a model first or use the default model option."
                type="warning"
                showIcon
                style={{ marginTop: '8px' }}
              />
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#000000d9',
              fontSize: '14px'
            }}>
              <span style={{ color: '#ff4d4f' }}>*</span> Writers Selection
              {writersLoading && <Spin size="small" style={{ marginLeft: '8px' }} />}
            </label>
            <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
              {!selectedDatasetId 
                ? 'Please select a dataset first to load available writers'
                : writersLoading 
                ? 'Loading writers for selected dataset...'
                : writers.length > 0
                ? `Select writers from the available list (${writers.length} writers found):`
                : 'No writers found for this dataset'
              }
            </div>
            {selectedDatasetId && !writersLoading && writers.length === 0 ? (
              <div style={{
                border: '1px dashed #d9d9d9',
                borderRadius: '6px',
                padding: '20px',
                textAlign: 'center',
                color: '#8c8c8c'
              }}>
                No writers found for this dataset
              </div>
            ) : (
              <Transfer
                dataSource={getWritersTransferData()}
                titles={['Available Writers', 'Selected Writers']}
                targetKeys={selectedWriters}
                selectedKeys={selectedKeys}
                onChange={handleWritersChange}
                onSelectChange={handleWritersSelectChange}
                render={(item) => (
                  <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                )}
                listStyle={{
                  width: 300,
                  height: 300,
                }}
                className="transfer-small-buttons"
                showSearch
                filterOption={(search, item) =>
                  item.title.toLowerCase().includes(search.toLowerCase()) ||
                  item.description.toLowerCase().includes(search.toLowerCase())
                }
                disabled={writersLoading || !selectedDatasetId || writers.length === 0}
                locale={{
                  itemUnit: 'writer',
                  itemsUnit: 'writers',
                  searchPlaceholder: 'Search writers',
                  notFoundContent: writersLoading ? 'Loading writers...' : 'No writers available'
                }}
              />
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#000000d9',
              fontSize: '14px'
            }}>
              <span style={{ color: '#ff4d4f' }}>*</span> Query Image
            </label>
            <Form.Item
              name="queryImage"
              rules={[{ required: true, message: 'Please upload a query image!' }]}
              style={{ marginBottom: 0 }}
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={(file) => {
                  handleImageUpload(file);
                  return false; // Prevent auto upload
                }}
                accept="image/*"
                onRemove={() => {
                  setQueryImageBase64('');
                  setQueryImageFile(null);
                }}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  size="large"
                  style={{ width: '100%' }}
                >
                  Upload Image
                </Button>
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#4F46E5' }} />
            Task Details
          </div>
        }
        open={isDetailsModalOpen}
        onCancel={() => {
          setIsDetailsModalOpen(false);
          setDetailedTask(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsDetailsModalOpen(false);
            setDetailedTask(null);
          }}>
            Close
          </Button>
        ]}
        width={600}
      >
        {loadingTaskDetails ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#8c8c8c' }}>Loading task details...</div>
          </div>
        ) : detailedTask ? (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Task ID" labelStyle={{ width: '150px', fontWeight: '500' }}>
              <code style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                {detailedTask.id}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="Name" labelStyle={{ fontWeight: '500' }}>
              {detailedTask.name}
            </Descriptions.Item>
            <Descriptions.Item label="Dataset" labelStyle={{ fontWeight: '500' }}>
              {detailedTask.datasetName}
            </Descriptions.Item>
            <Descriptions.Item label="Model" labelStyle={{ fontWeight: '500' }}>
              {detailedTask.modelName}
            </Descriptions.Item>
            <Descriptions.Item label="Selected Writers" labelStyle={{ fontWeight: '500' }}>
              {detailedTask.selectedWriters && detailedTask.selectedWriters.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {detailedTask.selectedWriters.map((writer, index) => (
                    <Tag key={index} color="blue" style={{ margin: '2px' }}>
                      {writer}
                    </Tag>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>No writers selected</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Status" labelStyle={{ fontWeight: '500' }}>
              <Tag color={getStatusColor(detailedTask.status)}>
                {getStatusText(detailedTask.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At" labelStyle={{ fontWeight: '500' }}>
              {new Date(detailedTask.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Modified At" labelStyle={{ fontWeight: '500' }}>
              {detailedTask.updatedAt ? new Date(detailedTask.updatedAt).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Query Image" labelStyle={{ fontWeight: '500' }}>
              <div style={{ 
                border: '2px dashed #d9d9d9', 
                borderRadius: '8px', 
                padding: '16px', 
                textAlign: 'center',
                backgroundColor: '#fafafa'
              }}>
                {detailedTask.queryImageBase64 ? (
                  <img 
                    src={`data:image/jpeg;base64,${detailedTask.queryImageBase64}`}
                    alt="Query handwriting sample"
                    style={{ 
                      maxWidth: '250px', 
                      maxHeight: '150px', 
                      borderRadius: '4px',
                      border: '2px solid #e0e0e0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <div style={{
                    padding: '20px',
                    color: '#8c8c8c',
                    fontSize: '14px'
                  }}>
                    No query image available
                  </div>
                )}
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic' 
                }}>
                  Query handwriting sample
                </div>
              </div>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
            No task details available
          </div>
        )}
      </Modal>

      {/* View Results Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOutlined style={{ color: '#10B981' }} />
            Task Results
          </div>
        }
        open={isResultsModalOpen}
        onCancel={() => {
          setIsResultsModalOpen(false);
          setPredictionResults(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsResultsModalOpen(false);
            setPredictionResults(null);
          }}>
            Close
          </Button>
        ]}
        width={700}
      >
        {loadingPredictionResults ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#8c8c8c' }}>Loading prediction results...</div>
          </div>
        ) : selectedTask && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Task ID" labelStyle={{ width: '150px', fontWeight: '500' }}>
              <code style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                {selectedTask.id}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="Name" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.name}
            </Descriptions.Item>
            <Descriptions.Item label="Dataset" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.datasetName}
            </Descriptions.Item>
            <Descriptions.Item label="Model" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.modelName}
            </Descriptions.Item>
            <Descriptions.Item label="Selected Writers" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.selectedWriters && selectedTask.selectedWriters.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedTask.selectedWriters.map((writer, index) => (
                    <Tag key={index} color="blue" style={{ margin: '2px' }}>
                      {writer}
                    </Tag>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>No writers selected</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Writer Identified" labelStyle={{ fontWeight: '500' }}>
              {(() => {
                const writerId = predictionResults?.prediction?.writer_id || selectedTask.writerIdentified;
                const isUnknown = writerId === 'unknown' || !writerId;
                const displayText = writerId || 'N/A';
                
                return (
                  <span style={{ 
                    color: isUnknown ? '#EF4444' : '#4F46E5', 
                    fontWeight: '600' 
                  }}>
                    {displayText}
                  </span>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Accuracy" labelStyle={{ fontWeight: '500' }}>
              {(() => {
                const writerId = predictionResults?.prediction?.writer_id || selectedTask.writerIdentified;
                const confidence = predictionResults?.prediction?.confidence;
                const taskAccuracy = selectedTask.accuracy;
                let displayText = 'N/A';
                let isNA = true;
                
                // If writer is unknown, always show N/A in red
                if (writerId === 'unknown') {
                  displayText = 'N/A';
                  isNA = true;
                } else if (confidence !== undefined && confidence !== null) {
                  displayText = `${(confidence * 100).toFixed(2)}%`;
                  isNA = false;
                } else if (taskAccuracy !== undefined && taskAccuracy !== null) {
                  displayText = `${taskAccuracy}%`;
                  isNA = false;
                }
                
                return (
                  <span style={{ 
                    color: isNA ? '#EF4444' : '#10B981', 
                    fontWeight: '600' 
                  }}>
                    {displayText}
                  </span>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Query Image" labelStyle={{ fontWeight: '500' }}>
              <div style={{ 
                border: '2px dashed #d9d9d9', 
                borderRadius: '8px', 
                padding: '16px', 
                textAlign: 'center',
                backgroundColor: '#fafafa'
              }}>
                {predictionResults?.query_image_base64 ? (
                  <img 
                    src={`data:image/jpeg;base64,${predictionResults.query_image_base64}`}
                    alt="Query handwriting sample"
                    style={{ 
                      maxWidth: '250px', 
                      maxHeight: '150px', 
                      borderRadius: '4px',
                      border: '2px solid #e0e0e0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <div style={{
                    padding: '20px',
                    color: '#8c8c8c',
                    fontSize: '14px'
                  }}>
                    No query image available
                  </div>
                )}
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic' 
                }}>
                  Query handwriting sample
                </div>
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Remove Task Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#EF4444' }} />
            Confirm Task Removal
          </div>
        }
        open={isRemoveConfirmOpen}
        onCancel={() => setIsRemoveConfirmOpen(false)}
        onOk={handleRemoveTask}
        okText="Remove Task"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: loading }}
        width={500}
      >
        {selectedTask && (
          <div>
            <Alert 
              message="This action cannot be undone" 
              type="warning" 
              showIcon 
              style={{ marginBottom: '16px' }}
            />
            <p style={{ margin: '0', color: '#1F2937' }}>
              Are you sure you want to remove the following task?
            </p>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '12px', 
              borderRadius: '6px', 
              marginTop: '12px',
              border: '1px solid #e5e7eb' 
            }}>
              <div><strong>Task ID:</strong> <code style={{ fontSize: '12px' }}>{selectedTask.id}</code></div>
              <div><strong>Name:</strong> {selectedTask.name}</div>
              <div><strong>Status:</strong> 
                <Tag color={getStatusColor(selectedTask.status)} style={{ marginLeft: '8px' }}>
                  {getStatusText(selectedTask.status)}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </Spin>
  );
};

export default TaskExecutor; 