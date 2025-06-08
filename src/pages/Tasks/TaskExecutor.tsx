import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, Dropdown, Space, Radio, Modal, Descriptions, Alert, Select, Transfer, Upload, Form, message } from 'antd';
import { useLocation } from 'react-router-dom';
import { 
  PlusOutlined, 
  MoreOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'antd/es/table/interface';

interface TaskData {
  key: string;
  taskId: string;
  dataset: string;
  model: string;
  status: 'executed' | 'failed' | 'processing';
  createdAt: string;
}

interface WriterItem {
  key: string;
  title: string;
  description: string;
}

const TaskExecutor: React.FC = () => {
  const location = useLocation();
  const [selectedTaskKey, setSelectedTaskKey] = useState<React.Key | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskForm] = Form.useForm();

  // Writers transfer data
  const [writersData] = useState<WriterItem[]>([
    { key: '1', title: 'Writer 1', description: 'Historical samples writer 1' },
    { key: '2', title: 'Writer 2', description: 'Historical samples writer 2' },
    { key: '3', title: 'Writer 3', description: 'Historical samples writer 3' },
    { key: '4', title: 'Writer 4', description: 'Historical samples writer 4' },
    { key: '5', title: 'Writer 5', description: 'Historical samples writer 5' },
    { key: '6', title: 'Writer 6', description: 'Historical samples writer 6' },
    { key: '7', title: 'Writer 7', description: 'Historical samples writer 7' },
    { key: '8', title: 'Writer 8', description: 'Historical samples writer 8' },
  ]);
  const [selectedWriters, setSelectedWriters] = useState<Key[]>(['6']);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  // Auto-open modal when navigated from Dashboard
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsCreateTaskModalOpen(true);
    }
  }, [location]);

  // Mock data for tasks
  const taskData: TaskData[] = [
    {
      key: '1',
      taskId: 'a1397625-1565-4642-8636-1ddd8df8b0d1',
      dataset: 'Historical Dataset',
      model: 'Default',
      status: 'executed',
      createdAt: '2024-01-15 10:30:00'
    },
    {
      key: '2', 
      taskId: 'b2847391-2675-5753-9747-2eee9ef9c1e2',
      dataset: 'Historical Dataset',
      model: 'Custom Model 1',
      status: 'failed',
      createdAt: '2024-01-15 11:15:00'
    },
    {
      key: '3',
      taskId: 'c3958462-3786-6864-a858-3fff0f0a0d2f3',
      dataset: 'Historical Dataset', 
      model: 'Custom Model 1',
      status: 'processing',
      createdAt: '2024-01-15 12:00:00'
    },
    {
      key: '4',
      taskId: 'd4069573-4897-7975-b969-4000101b1e4g4',
      dataset: 'Historical Dataset',
      model: 'Custom Model 1', 
      status: 'processing',
      createdAt: '2024-01-15 12:30:00'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'executed':
        return 'Executed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      default:
        return status;
    }
  };

  // Get selected task data
  const getSelectedTask = () => {
    return taskData.find(task => task.key === selectedTaskKey);
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
        disabled: false, // Enable view details to show modal
      }
    ];

    // Add status-specific actions
    if (selectedTask.status === 'executed') {
      items.push({
        key: 'results',
        label: 'View Results',
        icon: <EyeOutlined />,
        disabled: false,
      });
      items.push({
        key: 'remove',
        label: 'Remove Task',
        icon: <DeleteOutlined />,
        disabled: false,
        danger: true,
      });
    } else if (selectedTask.status === 'failed') {
      items.push({
        key: 'retry',
        label: 'Retry Task',
        icon: <ReloadOutlined />,
        disabled: false,
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
  const handleRemoveTask = () => {
    const selectedTask = getSelectedTask();
    if (selectedTask) {
      console.log('Task removed:', selectedTask.taskId);
      // Here you would typically make an API call to remove the task
      // For now, we'll just close the modal and clear selection
      setIsRemoveConfirmOpen(false);
      setSelectedTaskKey(null);
      // You could also update the taskData state to remove the task from the UI
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
  const handleCreateTask = () => {
    // Manual validation for writers selection
    if (selectedWriters.length === 0) {
      message.error('Please select at least one writer!');
      return;
    }

    createTaskForm.validateFields().then((values) => {
      console.log('Creating task with values:', values);
      console.log('Selected writers:', selectedWriters);
      message.success('Task created successfully!');
      setIsCreateTaskModalOpen(false);
      createTaskForm.resetFields();
      setSelectedWriters(['6']); // Reset to default selection
      setSelectedKeys([]); // Reset selected keys
    }).catch((errorInfo) => {
      console.log('Validation failed:', errorInfo);
    });
  };

  // Handle create task modal close
  const handleCreateTaskModalClose = () => {
    setIsCreateTaskModalOpen(false);
    createTaskForm.resetFields();
    setSelectedWriters(['6']); // Reset to default selection
    setSelectedKeys([]); // Reset selected keys
  };

  const columns: ColumnsType<TaskData> = [
    {
      title: '',
      dataIndex: 'select',
      width: 50,
      render: (_, record) => (
        <Radio
          checked={selectedTaskKey === record.key}
          onChange={() => {
            setSelectedTaskKey(record.key);
          }}
        />
      ),
    },
    {
      title: 'Task ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 300,
      render: (text) => (
        <span className="task-id">{text}</span>
      ),
    },
    {
      title: 'Dataset',
      dataIndex: 'dataset',
      key: 'dataset',
      render: (text) => (
        <span className="dataset-name">{text}</span>
      ),
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      render: (text) => (
        <span className="model-name">{text}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="status-tag">
          {getStatusText(status)}
        </Tag>
      ),
    },
  ];

  const handleActionClick = ({ key }: { key: string }) => {
    const selectedTask = getSelectedTask();
    console.log(`Action clicked: ${key}`, selectedTask);
    
    // Handle different actions
    switch (key) {
      case 'retry':
        console.log('Retrying task:', selectedTask?.taskId);
        break;
      case 'remove':
        setIsRemoveConfirmOpen(true);
        break;
      case 'results':
        setIsResultsModalOpen(true);
        break;
      case 'details':
        setIsDetailsModalOpen(true);
        break;
      default:
        break;
    }
  };

  const selectedTask = getSelectedTask();

  return (
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
            disabled={!selectedTaskKey}
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
            className="create-task-button"
            onClick={() => setIsCreateTaskModalOpen(true)}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Task Table */}
      <div className="task-table-container">
        <Table
          columns={columns}
          dataSource={taskData}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tasks`,
            pageSize: 10,
          }}
          className="task-table"
          size="middle"
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
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          >
            Execute
          </Button>
        ]}
        width={800}
        maskClosable={false}
      >
        <Form
          form={createTaskForm}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
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
            <Form.Item
              name="dataset"
              rules={[{ required: true, message: 'Please select a dataset!' }]}
              style={{ marginBottom: 0 }}
            >
              <Select placeholder="Dataset" size="large">
                <Select.Option value="historical-dataset">Historical Dataset</Select.Option>
                <Select.Option value="modern-dataset">Modern Dataset</Select.Option>
                <Select.Option value="custom-dataset">Custom Dataset</Select.Option>
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
<span style={{ color: '#ff4d4f' }}>*</span> Writers Selection
             </label>
             <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
               Select writers from the available list:
             </div>
             <Transfer
               dataSource={writersData}
               titles={['Available Writers', 'Selected Writers']}
               targetKeys={selectedWriters}
               selectedKeys={selectedKeys}
               onChange={handleWritersChange}
               onSelectChange={handleWritersSelectChange}
               render={(item) => item.title}
               listStyle={{
                 width: 300,
                 height: 300,
               }}
               className="transfer-small-buttons"
               showSearch
               filterOption={(search, item) =>
                 item.title.toLowerCase().includes(search.toLowerCase())
               }
             />
           </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#000000d9',
              fontSize: '14px'
            }}>
<span style={{ color: '#ff4d4f' }}>*</span> Model
            </label>
            <Form.Item
              name="model"
              rules={[{ required: true, message: 'Please select a model!' }]}
              style={{ marginBottom: 0 }}
            >
              <Select placeholder="Model" size="large">
                <Select.Option value="default">Default</Select.Option>
                <Select.Option value="custom-model-1">Custom Model 1</Select.Option>
                <Select.Option value="custom-model-2">Custom Model 2</Select.Option>
                <Select.Option value="cnn-classifier">CNN Writer Classifier</Select.Option>
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
                beforeUpload={() => false} // Prevent auto upload
                accept="image/*"
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
        onCancel={() => setIsDetailsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailsModalOpen(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedTask && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Task ID" labelStyle={{ width: '150px', fontWeight: '500' }}>
              <code style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                {selectedTask.taskId}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="Dataset" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.dataset}
            </Descriptions.Item>
            <Descriptions.Item label="Model" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.model}
            </Descriptions.Item>
            <Descriptions.Item label="Status" labelStyle={{ fontWeight: '500' }}>
              <Tag color={getStatusColor(selectedTask.status)}>
                {getStatusText(selectedTask.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Query Image" labelStyle={{ fontWeight: '500' }}>
              <div style={{ 
                border: '2px dashed #d9d9d9', 
                borderRadius: '8px', 
                padding: '16px', 
                textAlign: 'center',
                backgroundColor: '#fafafa'
              }}>
                                 <img 
                   src="https://via.placeholder.com/250x150/ffffff/333333?text=Sample+Handwriting+Text" 
                   alt="Query handwriting sample"
                   style={{ 
                     maxWidth: '250px', 
                     maxHeight: '150px', 
                     borderRadius: '4px',
                     border: '2px solid #e0e0e0',
                     boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                   }}
                 />
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

      {/* View Results Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOutlined style={{ color: '#10B981' }} />
            Task Results
          </div>
        }
        open={isResultsModalOpen}
        onCancel={() => setIsResultsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsResultsModalOpen(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedTask && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Task ID" labelStyle={{ width: '150px', fontWeight: '500' }}>
              <code style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                {selectedTask.taskId}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="Dataset" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.dataset}
            </Descriptions.Item>
            <Descriptions.Item label="Model" labelStyle={{ fontWeight: '500' }}>
              {selectedTask.model}
            </Descriptions.Item>
            <Descriptions.Item label="Writer Identified" labelStyle={{ fontWeight: '500' }}>
              <span style={{ color: '#4F46E5', fontWeight: '600' }}>Writer #5 - Shakespeare Style</span>
            </Descriptions.Item>
            <Descriptions.Item label="Accuracy" labelStyle={{ fontWeight: '500' }}>
              <span style={{ color: '#10B981', fontWeight: '600' }}>94.2%</span>
            </Descriptions.Item>
            <Descriptions.Item label="Query Image" labelStyle={{ fontWeight: '500' }}>
              <div style={{ 
                border: '2px dashed #d9d9d9', 
                borderRadius: '8px', 
                padding: '16px', 
                textAlign: 'center',
                backgroundColor: '#fafafa'
              }}>
                <img 
                  src="https://via.placeholder.com/250x150/ffffff/333333?text=Sample+Handwriting+Text" 
                  alt="Query handwriting sample"
                  style={{ 
                    maxWidth: '250px', 
                    maxHeight: '150px', 
                    borderRadius: '4px',
                    border: '2px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
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
        okButtonProps={{ danger: true }}
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
              <div><strong>Task ID:</strong> <code style={{ fontSize: '12px' }}>{selectedTask.taskId}</code></div>
              <div><strong>Dataset:</strong> {selectedTask.dataset}</div>
              <div><strong>Model:</strong> {selectedTask.model}</div>
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
  );
};

export default TaskExecutor; 