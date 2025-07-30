import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Upload, 
  message, 
  Radio, 
  Checkbox, 
  Row, 
  Col,
  Divider,
  Alert,
  Spin
} from 'antd';
import { 
  InboxOutlined, 
  PlusOutlined, 
  ExperimentOutlined,
  DatabaseOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { modelService, ModelResponse } from '../../services/modelService';
import datasetService, { Dataset } from '../../services/datasetService';
import taskService, { CreateTaskRequest, DatasetAnalysisResponse } from '../../services/taskService';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface CreateTaskFormValues {
  name: string;
  description: string;
  datasetId: string;
  useDefaultModel: boolean;
  modelId?: string;
  selectedWriters: string[];
  queryImage: any;
}

const CreateTask: React.FC = () => {
  const [form] = Form.useForm<CreateTaskFormValues>();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [models, setModels] = useState<ModelResponse[]>([]);
  const [writers, setWriters] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [useDefaultModel, setUseDefaultModel] = useState(true);
  const [queryImageBase64, setQueryImageBase64] = useState<string>('');
  const [loadingWriters, setLoadingWriters] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        
        // Load datasets and models in parallel
        const [datasetsResponse, modelsResponse] = await Promise.all([
          datasetService.getDatasets(),
          modelService.getAllModels()
        ]);
        
        // Filter for completed datasets and trained models
        const completedDatasets = datasetsResponse.filter((dataset: Dataset) => dataset.status === 2); // Completed
        const trainedModels = modelsResponse.filter((model: ModelResponse) => model.status === 'trained');
        
        setDatasets(completedDatasets);
        setModels(trainedModels);
        
        if (completedDatasets.length === 0) {
          message.warning('No completed datasets available. Please complete dataset analysis first.');
        }
        
      } catch (error) {
        console.error('Error loading initial data:', error);
        message.error('Failed to load datasets and models');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  // Load writers when dataset changes
  useEffect(() => {
    if (selectedDataset) {
      loadWriters(selectedDataset);
    }
  }, [selectedDataset]);

  const loadWriters = async (datasetId: string) => {
    try {
      setLoadingWriters(true);
      const analysisResponse: DatasetAnalysisResponse = await taskService.getDatasetAnalysis(datasetId);
      setWriters(analysisResponse.writer_names || []);
    } catch (error) {
      console.error('Error loading writers:', error);
      message.error('Failed to load writers for selected dataset');
      setWriters([]);
    } finally {
      setLoadingWriters(false);
    }
  };

  const handleDatasetChange = (value: string) => {
    setSelectedDataset(value);
    form.setFieldsValue({ selectedWriters: [] }); // Clear selected writers
    setWriters([]);
  };

  const handleModelTypeChange = (e: any) => {
    const useDefault = e.target.value;
    setUseDefaultModel(useDefault);
    
    if (useDefault) {
      form.setFieldsValue({ modelId: undefined });
    }
  };

  const handleImageUpload = (info: any) => {
    const file = info.file;
    
    if (file.status === 'uploading') {
      return;
    }
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      // Remove data:image/...;base64, prefix
      const base64Data = base64String.split(',')[1];
      setQueryImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (values: CreateTaskFormValues) => {
    try {
      setLoading(true);
      
      if (!queryImageBase64) {
        message.error('Please upload a query image');
        return;
      }
      
      if (!values.selectedWriters || values.selectedWriters.length === 0) {
        message.error('Please select at least one writer');
        return;
      }

      const createTaskData: CreateTaskRequest = {
        name: values.name,
        description: values.description || '',
        datasetId: values.datasetId,
        selectedWriters: values.selectedWriters,
        useDefaultModel: values.useDefaultModel,
        modelId: values.useDefaultModel ? undefined : values.modelId,
        queryImageBase64: queryImageBase64
      };

      await taskService.createTask(createTaskData);
      message.success('Task created successfully!');
      navigate('/tasks');
      
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: () => false, // Prevent automatic upload
    onChange: handleImageUpload,
  };

  if (loadingData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading datasets and models...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">
        Create Task
      </h1>
      
      <Card className="content-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            useDefaultModel: true,
            selectedWriters: []
          }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Task Name"
                rules={[{ required: true, message: 'Please enter task name' }]}
              >
                <Input 
                  placeholder="Enter task name"
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea 
                  placeholder="Enter task description (optional)"
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Dataset Selection</Divider>
          
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="datasetId"
                label="Select Dataset"
                rules={[{ required: true, message: 'Please select a dataset' }]}
              >
                <Select
                  placeholder="Choose a dataset"
                  onChange={handleDatasetChange}
                  prefix={<DatabaseOutlined />}
                >
                  {datasets.map(dataset => (
                    <Option key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.fileCount || 0} files)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedDataset && (
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="selectedWriters"
                  label="Select Writers"
                  rules={[{ required: true, message: 'Please select at least one writer' }]}
                >
                  <Spin spinning={loadingWriters}>
                    <Checkbox.Group>
                      <Row>
                        {writers.map(writer => (
                          <Col span={8} key={writer}>
                            <Checkbox value={writer}>{writer}</Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  </Spin>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Divider orientation="left">Model Selection</Divider>
          
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="useDefaultModel"
                label="Model Type"
              >
                <Radio.Group onChange={handleModelTypeChange} value={useDefaultModel}>
                  <Radio value={true}>Use Default Model</Radio>
                  <Radio value={false}>Use Custom Trained Model</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {!useDefaultModel && (
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="modelId"
                  label="Select Model"
                  rules={[{ required: !useDefaultModel, message: 'Please select a model' }]}
                >
                  <Select
                    placeholder="Choose a trained model"
                    prefix={<ExperimentOutlined />}
                  >
                    {models.map(model => (
                      <Option key={model.id} value={model.id}>
                        {model.name} - {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A'} accuracy
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {models.length === 0 && !useDefaultModel && (
            <Alert
              message="No trained models available"
              description="Please train a model first or use the default model option."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider orientation="left">Query Image</Divider>
          
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Upload Query Image"
                required
              >
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag handwriting image to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for single image upload. Only image files are allowed.
                  </p>
                </Dragger>
                {queryImageBase64 && (
                  <div style={{ marginTop: 16 }}>
                    <img 
                      src={`data:image/jpeg;base64,${queryImageBase64}`} 
                      alt="Query preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<PlusOutlined />}
                  size="large"
                >
                  Create Task
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTask; 