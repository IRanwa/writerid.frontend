import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Dropdown, Modal, Form, Input, Select, Alert, Radio, Row, Col, Spin, message } from 'antd';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllModels, createModel, deleteModel, fetchModelById } from '../../store/slices/modelsSlice';
import { fetchDatasets } from '../../store/slices/datasetsSlice';
import modelService from '../../services/modelService';
import { 
  PlusOutlined, 
  MoreOutlined, 
  EyeOutlined, 
  DeleteOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MenuProps } from 'antd';
import type { Key } from 'react';

// Model interface for table data
interface ModelData {
  key: string;
  modelId: string;
  name: string;
  status: number; // Same as datasets: 0=Created, 1=Processing, 2=Completed, 3=Failed
  createdAt: string;
  updatedAt: string;
  trainingDatasetName: string;
  trainingDatasetId?: string;
  accuracy?: number;
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

const ModelsList: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { models, loading, error } = useAppSelector((state) => state.models);
  const { datasets, loading: datasetsLoading, error: datasetsError } = useAppSelector((state) => state.datasets);
  
  const [selectedModelKey, setSelectedModelKey] = useState<Key | null>(null);
  const [isNewModelModalOpen, setIsNewModelModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTrainResultsModalOpen, setIsTrainResultsModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [trainingResults, setTrainingResults] = useState<any>(null);
  const [loadingTrainingResults, setLoadingTrainingResults] = useState(false);
  const [retrainingModel, setRetrainingModel] = useState(false);
  const [creatingModel, setCreatingModel] = useState(false);
  const [removingModel, setRemovingModel] = useState(false);
  const [loadingModelDetails, setLoadingModelDetails] = useState(false);
  const [newModelForm] = Form.useForm();

  // Fetch models on component mount
  useEffect(() => {
    dispatch(fetchAllModels());
  }, [dispatch]);

  // Auto-open modal when navigated from Dashboard
  useEffect(() => {
    if (location.state?.openNewModelModal) {
      setIsNewModelModalOpen(true);
      // Also fetch datasets when auto-opening
      dispatch(fetchDatasets());
    }
  }, [location, dispatch]);

  // Show error message if API call fails
  useEffect(() => {
    if (error) {
      message.error(`Failed to fetch models: ${error}`);
    }
  }, [error]);

  // Show error message if datasets API call fails
  useEffect(() => {
    if (datasetsError) {
      message.error(`Failed to fetch datasets: ${datasetsError}`);
    }
  }, [datasetsError]);

  // Transform Redux models to match the expected format
  const modelData: ModelData[] = models.map((model) => ({
    key: model.id,
    modelId: model.id,
    name: model.name,
    status: model.status, // Already numeric from Redux store
    createdAt: model.createdAt,
    updatedAt: model.updatedAt || model.createdAt,
    trainingDatasetId: model.datasetId,
    trainingDatasetName: model.trainingDatasetName || model.trainedOn || 'Unknown Dataset',
    accuracy: model.accuracy,
    performanceData: model.performanceData
  }));

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

  const getSelectedModel = () => {
    return modelData.find(model => model.key === selectedModelKey);
  };

  const getActionItems = (): MenuProps['items'] => {
    const selectedModel = getSelectedModel();
    
    if (!selectedModel) {
      return [
        {
          key: 'view',
          label: 'View Details',
          icon: <EyeOutlined />,
          disabled: true,
        },
        {
          key: 'viewResults',
          label: 'View Train Results',
          icon: <InfoCircleOutlined />,
          disabled: true,
        },
        {
          key: 'retrain',
          label: 'Retrain Model',
          icon: <PlayCircleOutlined />,
          disabled: true,
        },
        {
          key: 'remove',
          label: 'Remove Model',
          icon: <DeleteOutlined />,
          disabled: true,
          danger: true,
        },
      ];
    }

    const actions = [
      {
        key: 'view',
        label: loadingModelDetails ? 'Loading...' : 'View Details',
        icon: <EyeOutlined />,
        disabled: loadingModelDetails,
      },
    ];

    // Hide these actions if model is in processing status (status 1)
    if (selectedModel.status !== 1) {
      actions.push(
        {
          key: 'viewResults',
          label: loadingTrainingResults ? 'Loading...' : 'View Train Results',
          icon: <InfoCircleOutlined />,
          disabled: selectedModel.status !== 2 || loadingTrainingResults, // Disabled if not completed or loading
        } as any,
        {
          key: 'retrain',
          label: retrainingModel ? 'Retraining...' : 'Retrain Model',
          icon: <PlayCircleOutlined />,
          disabled: retrainingModel, // Disabled only when currently retraining
        } as any,
        {
          key: 'remove',
          label: removingModel ? 'Removing...' : 'Remove Model',
          icon: <DeleteOutlined />,
          disabled: removingModel,
          danger: true,
        } as any
      );
    }

    return actions;
  };

  const handleActionClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'view':
        handleViewModelDetails();
        break;
      case 'viewResults':
        handleViewTrainingResults();
        break;
      case 'retrain':
        handleRetrainModel();
        break;
      case 'remove':
        setIsRemoveConfirmOpen(true);
        break;
    }
  };

  const handleViewModelDetails = async () => {
    if (!selectedModelKey) return;
    
    setLoadingModelDetails(true);
    try {
      // Fetch fresh model details
      await dispatch(fetchModelById(selectedModelKey.toString())).unwrap();
      setIsDetailsModalOpen(true);
    } catch (error: any) {
      message.error(`Failed to load model details: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setLoadingModelDetails(false);
    }
  };

  const handleViewTrainingResults = async () => {
    if (!selectedModelKey) return;
    
    setLoadingTrainingResults(true);
    try {
      const results = await modelService.getModelTrainingResults(selectedModelKey.toString());
      setTrainingResults(results);
      setIsTrainResultsModalOpen(true);
    } catch (error: any) {
      message.error(`Failed to fetch training results: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setLoadingTrainingResults(false);
    }
  };

  const handleTrainResultsModalClose = () => {
    setIsTrainResultsModalOpen(false);
    setTrainingResults(null);
  };

  const handleRetrainModel = async () => {
    if (!selectedModelKey) return;
    
    setRetrainingModel(true);
    try {
      await modelService.retrainModel(selectedModelKey.toString());
      
      // Show success toast message
      message.success('Model retraining initiated successfully!');
      
      // Refresh the grid
      dispatch(fetchAllModels());
      
    } catch (error: any) {
      // Show error toast message
      message.error(`Failed to initiate retraining: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setRetrainingModel(false);
    }
  };

  const handleRemoveModel = async () => {
    if (!selectedModelKey) return;
    
    setRemovingModel(true);
    try {
      await dispatch(deleteModel(selectedModelKey.toString())).unwrap();
      message.success('Model removed successfully!');
      setIsRemoveConfirmOpen(false);
      setSelectedModelKey(null);
    } catch (error: any) {
      message.error(`Failed to remove model: ${error}`);
    } finally {
      setRemovingModel(false);
    }
  };

  const handleCreateModel = () => {
    newModelForm.validateFields().then(async (values) => {
      setCreatingModel(true);
      try {
        const modelData = {
          name: values.name,
          trainingDatasetId: values.dataset
        };
        
        // Create the model via API
        await dispatch(createModel(modelData)).unwrap();
        
        // Show success toast
        message.success('Model created successfully!');
        
        // Close the popup
        setIsNewModelModalOpen(false);
        
        // Reset the form
        newModelForm.resetFields();
        
        // Refresh the table by calling get all models
        dispatch(fetchAllModels());
        
      } catch (error: any) {
        message.error(`Failed to create model: ${error}`);
      } finally {
        setCreatingModel(false);
      }
    });
  };

  const handleNewModelModalClose = () => {
    setIsNewModelModalOpen(false);
    newModelForm.resetFields();
  };

  const handleNewModelClick = () => {
    setIsNewModelModalOpen(true);
    // Fetch datasets when opening the modal
    dispatch(fetchDatasets());
  };

  // Filter datasets to show only completed ones for model training
  const getAvailableDatasets = () => {
    return datasets.filter(dataset => dataset.status === 2); // 2 = Completed status
  };

  const columns = [
    {
      title: '',
      key: 'selection',
      width: 50,
      render: (_: any, record: ModelData) => (
        <Radio
          checked={selectedModelKey === record.key}
          onChange={() => setSelectedModelKey(record.key)}
        />
      ),
    },
    {
      title: 'Model ID',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 300,
      render: (id: string) => (
        <span className="task-id">{id}</span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="model-name" style={{ fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: 'Training Dataset',
      dataIndex: 'trainingDatasetName',
      key: 'trainingDatasetName',
      render: (datasetName: string) => (
        <span style={{ color: '#666' }}>{datasetName}</span>
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
      render: (date: string) => (
        <span style={{ color: '#666', fontSize: '13px' }}>
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => (
        <span style={{ color: '#666', fontSize: '13px' }}>
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Header Section */}
      <div className="flex-row-between">
        <h1 className="page-title">Models</h1>
        <div className="header-actions">
          <Dropdown
            menu={{
              items: getActionItems(),
              onClick: handleActionClick,
            }}
            placement="bottomRight"
            disabled={!selectedModelKey}
          >
            <Button>
              <Space>
                Actions
                <MoreOutlined />
              </Space>
            </Button>
          </Dropdown>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleNewModelClick}
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          >
            New Model
          </Button>
        </div>
      </div>

      {/* Models Table */}
      <div className="task-table-container">
        <Table
          columns={columns}
          dataSource={modelData}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} models`,
            pageSize: 10,
          }}
          className="task-table"
          size="middle"
        />
      </div>

      {/* New Model Modal */}
      <Modal
        title="Create New Model"
        open={isNewModelModalOpen}
        onCancel={handleNewModelModalClose}
        footer={[
          <Button key="cancel" onClick={handleNewModelModalClose} disabled={creatingModel}>
            Cancel
          </Button>,
          <Button 
            key="create" 
            type="primary" 
            onClick={handleCreateModel}
            loading={creatingModel}
            disabled={creatingModel}
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          >
            {creatingModel ? 'Creating...' : 'Create Model'}
          </Button>
        ]}
        width={600}
        maskClosable={!creatingModel}
        closable={!creatingModel}
      >
        <Form
          form={newModelForm}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600 }}><span style={{ color: '#ff4d4f' }}>*</span> Model Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter a model name!' }]}
            required={false}
          >
            <Input 
              placeholder="Enter model name" 
              size="large"
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600 }}><span style={{ color: '#ff4d4f' }}>*</span> Dataset</span>}
            name="dataset"
            rules={[{ required: true, message: 'Please select a dataset!' }]}
            required={false}
          >
            <Select 
              placeholder={datasetsLoading ? "Loading datasets..." : "Select dataset for training"}
              size="large"
              style={{ borderRadius: '6px' }}
              loading={datasetsLoading}
              disabled={datasetsLoading}
              notFoundContent={datasetsLoading ? "Loading..." : "No completed datasets available"}
            >
              {getAvailableDatasets().map((dataset) => (
                <Select.Option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>


        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#4F46E5' }} />
            Model Details
          </div>
        }
        open={isDetailsModalOpen}
        onCancel={() => setIsDetailsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailsModalOpen(false)}>
            Close
          </Button>
        ]}
        width={900}
      >
        {loadingModelDetails && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#666' }}>Loading model details...</p>
          </div>
        )}
        {!loadingModelDetails && getSelectedModel() && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <strong>Model ID:</strong> 
              <code style={{ marginLeft: '8px', fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                {getSelectedModel()?.modelId}
              </code>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Name:</strong> <span style={{ marginLeft: '8px' }}>{getSelectedModel()?.name}</span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Training Dataset:</strong> <span style={{ marginLeft: '8px' }}>{getSelectedModel()?.trainingDatasetName}</span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Status:</strong> 
              <Tag color={getStatusColor(getSelectedModel()?.status || 0)} style={{ marginLeft: '8px' }}>
                {getStatusText(getSelectedModel()?.status || 0)}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Created At:</strong> <span style={{ marginLeft: '8px' }}>{getSelectedModel()?.createdAt}</span>
            </div>
            
            {/* Performance Summary - only show for processed models */}
            {getSelectedModel()?.status === 2 && getSelectedModel()?.performanceData && (
              <>
                <div style={{ 
                  borderTop: '1px solid #e5e7eb', 
                  marginTop: '20px', 
                  paddingTop: '16px',
                  marginBottom: '16px' 
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '14px', fontWeight: 600 }}>
                    Performance Summary
                  </h4>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4F46E5' }}>{getSelectedModel()?.performanceData?.accuracy.toFixed(1)}%</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Accuracy</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>{getSelectedModel()?.performanceData?.time.toFixed(1)}s</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Training Time</div>
                    </div>
                  </Col>
                </Row>
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Use "View Train Results" for detailed performance analysis
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* View Train Results Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#4F46E5' }} />
            Training Results Analysis
          </div>
        }
        open={isTrainResultsModalOpen}
        onCancel={handleTrainResultsModalClose}
        footer={[
          <Button key="close" onClick={handleTrainResultsModalClose}>
            Close
          </Button>
        ]}
        width={1000}
      >
        {loadingTrainingResults && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#666' }}>Loading training results...</p>
          </div>
        )}
        {!loadingTrainingResults && getSelectedModel() && (trainingResults || getSelectedModel()?.performanceData) && (
          <div style={{ marginTop: '20px' }}>
            {/* Show success message if training results loaded from API */}
            {trainingResults?.message && !trainingResults?.trainingResults?.error && (
              <Alert
                message="Training Results"
                description={trainingResults.message}
                type="success"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}
            
            {/* Show error message if training failed */}
            {trainingResults?.trainingResults?.error && (
              <Alert
                message="Training Error"
                description={trainingResults.trainingResults.error}
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}
            {/* Training Details */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '14px', fontWeight: 600 }}>
                Training Information
              </h4>
              <Row gutter={16} style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4F46E5' }}>
                      {((trainingResults?.trainingResults?.time || getSelectedModel()?.performanceData?.time || 0)).toFixed(2)}s
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Training Time</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                      {trainingResults?.trainingResults?.actual_episodes_run || getSelectedModel()?.performanceData?.actual_episodes_run || 0}/
                      {trainingResults?.trainingResults?.requested_episodes || getSelectedModel()?.performanceData?.requested_episodes || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Episodes Completed</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#DC2626' }}>
                      {trainingResults?.trainingResults?.optimal_val_episode || getSelectedModel()?.performanceData?.optimal_val_episode || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Optimal Episode</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Additional Training Metrics - only show if from API */}
            {trainingResults?.trainingResults && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '14px', fontWeight: 600 }}>
                  Additional Training Metrics
                </h4>
                <Row gutter={16} style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B5CF6' }}>
                        {trainingResults.trainingResults.best_val_accuracy?.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Best Validation Accuracy</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#F59E0B' }}>
                        {trainingResults.trainingResults.optimal_threshold}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Optimal Threshold</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981' }}>
                        {(trainingResults.trainingResults.threshold_accuracy * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Threshold Accuracy</div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Performance Metrics Chart */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '14px', fontWeight: 600 }}>
                Performance Metrics
              </h4>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Accuracy', value: trainingResults?.trainingResults?.accuracy || getSelectedModel()?.performanceData?.accuracy || 0 },
                      { name: 'Precision', value: trainingResults?.trainingResults?.precision || getSelectedModel()?.performanceData?.precision || 0 },
                      { name: 'Recall', value: trainingResults?.trainingResults?.recall || getSelectedModel()?.performanceData?.recall || 0 },
                      { name: 'F1-Score', value: trainingResults?.trainingResults?.f1_score || getSelectedModel()?.performanceData?.f1_score || 0 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Score']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                      <Cell fill="#FF6B6B" />
                      <Cell fill="#4ECDC4" />
                      <Cell fill="#45B7D1" />
                      <Cell fill="#96CEB4" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '14px', fontWeight: 600 }}>
                Confusion Matrix (5 Writers)
              </h4>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
                {/* Matrix Container */}
                <div>
                  {/* Column Headers */}
                  <div style={{ display: 'flex', marginBottom: '4px', marginLeft: '40px' }}>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>
                      Predicted
                    </div>
                  </div>
                  <div style={{ display: 'flex', marginBottom: '8px', marginLeft: '40px' }}>
                    {['W1', 'W2', 'W3', 'W4', 'W5'].map((writer, index) => (
                      <div
                        key={index}
                        style={{
                          width: '60px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#555',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          borderRadius: '4px',
                          marginRight: '2px'
                        }}
                      >
                        {writer}
                      </div>
                    ))}
                  </div>

                  {/* Matrix with Row Labels */}
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {/* Row Labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '8px' }}>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#666', 
                        fontWeight: 'bold', 
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                        width: '24px'
                      }}>
                        Actual
                      </div>
                      {['W1', 'W2', 'W3', 'W4', 'W5'].map((writer, index) => (
                        <div
                          key={index}
                          style={{
                            width: '28px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#555',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '4px',
                            marginBottom: '2px'
                          }}
                        >
                          {writer}
                        </div>
                      ))}
                    </div>

                    {/* Matrix Grid */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, 1fr)', 
                      gap: '2px',
                      backgroundColor: '#f8f9fa',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      {(trainingResults?.trainingResults?.confusion_matrix || getSelectedModel()?.performanceData?.confusion_matrix || []).flat().map((value: number, index: number) => {
                        const row = Math.floor(index / 5);
                        const col = index % 5;
                        const isDiagonal = row === col;
                        const confusionMatrix = trainingResults?.trainingResults?.confusion_matrix || getSelectedModel()?.performanceData?.confusion_matrix || [];
                        const maxValue = Math.max(...(confusionMatrix.flat() || [30]));
                        const intensity = Math.min(value / maxValue, 1);
                        
                        return (
                          <div
                            key={index}
                            style={{
                              backgroundColor: isDiagonal 
                                ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})` // Green for diagonal (correct predictions)
                                : `rgba(239, 68, 68, ${0.1 + intensity * 0.6})`, // Red for off-diagonal (errors)
                              color: (isDiagonal && value > maxValue * 0.4) || (!isDiagonal && value > maxValue * 0.3) ? 'white' : 'black',
                              padding: '16px 10px',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              borderRadius: '6px',
                              border: isDiagonal ? '2px solid #22c55e' : '1px solid #f3f4f6',
                              minHeight: '60px',
                              minWidth: '60px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              boxShadow: isDiagonal ? '0 2px 4px rgba(34, 197, 94, 0.2)' : 'none'
                            }}
                            title={`Actual: Writer ${row + 1}, Predicted: Writer ${col + 1}, Count: ${value}`}
                          >
                            {value}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Legend and Statistics */}
                <div style={{ minWidth: '200px' }}>
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                      Legend
                    </h5>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          backgroundColor: 'rgba(34, 197, 94, 0.7)',
                          borderRadius: '3px',
                          border: '2px solid #22c55e'
                        }}></div>
                        <span style={{ fontSize: '11px', color: '#555' }}>Correct Predictions</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          backgroundColor: 'rgba(239, 68, 68, 0.4)',
                          borderRadius: '3px',
                          border: '1px solid #f3f4f6'
                        }}></div>
                        <span style={{ fontSize: '11px', color: '#555' }}>Misclassifications</span>
                      </div>
                    </div>
                    
                    <h5 style={{ margin: '12px 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                      Quick Stats
                    </h5>
                    <div style={{ fontSize: '11px', color: '#555' }}>
                      <div>Total Samples: {getSelectedModel()?.performanceData?.confusion_matrix?.flat().reduce((a, b) => a + b, 0) || 0}</div>
                      <div>Correct: {getSelectedModel()?.performanceData?.confusion_matrix?.map((row, i) => row[i]).reduce((a, b) => a + b, 0) || 0}</div>
                      <div>Errors: {(getSelectedModel()?.performanceData?.confusion_matrix?.flat().reduce((a, b) => a + b, 0) || 0) - (getSelectedModel()?.performanceData?.confusion_matrix?.map((row, i) => row[i]).reduce((a, b) => a + b, 0) || 0)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Remove Model Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#EF4444' }} />
            Confirm Model Removal
          </div>
        }
        open={isRemoveConfirmOpen}
        onCancel={() => setIsRemoveConfirmOpen(false)}
        onOk={handleRemoveModel}
        okText={removingModel ? "Removing..." : "Remove Model"}
        cancelText="Cancel"
        okButtonProps={{ 
          danger: true, 
          loading: removingModel,
          disabled: removingModel
        }}
        cancelButtonProps={{
          disabled: removingModel
        }}
        closable={!removingModel}
        maskClosable={!removingModel}
        width={500}
      >
        {getSelectedModel() && (
          <div>
            <Alert 
              message="This action cannot be undone" 
              type="warning" 
              showIcon 
              style={{ marginBottom: '16px' }}
            />
            <p style={{ margin: '0', color: '#1F2937' }}>
              Are you sure you want to remove the following model?
            </p>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '12px', 
              borderRadius: '6px', 
              marginTop: '12px',
              border: '1px solid #e5e7eb' 
            }}>
              <div><strong>Model ID:</strong> <code style={{ fontSize: '12px' }}>{getSelectedModel()?.modelId}</code></div>
              <div><strong>Name:</strong> {getSelectedModel()?.name}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModelsList; 