import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import { PlusOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';

const TasksList: React.FC = () => {
  const mockTasks = [
    {
      key: '1',
      id: 'TSK-001',
      name: 'Writer Classification Task',
      status: 'completed',
      dataset: 'Handwriting Dataset A',
      model: 'CNN Classifier v1',
      createdAt: '2024-01-15',
      accuracy: '94.5%'
    },
    {
      key: '2', 
      id: 'TSK-002',
      name: 'Style Analysis Task',
      status: 'running',
      dataset: 'Writing Samples B',
      model: 'RNN Analyzer',
      createdAt: '2024-01-16',
      accuracy: '-'
    }
  ];

  const columns = [
    {
      title: 'Task ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag className={`status-${status === 'completed' ? 'success' : status === 'running' ? 'processing' : 'error'}`}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Dataset',
      dataIndex: 'dataset',
      key: 'dataset',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>View</Button>
          <Button size="small" icon={<PlayCircleOutlined />}>Execute</Button>
        </Space>
      ),
    },
  ];

  return (
          <div>
        <div className="flex-row-between">
          <h1 className="page-title">
            Tasks
          </h1>
          <Button type="primary" icon={<PlusOutlined />} className="primary-button">
            Create Task
          </Button>
        </div>
        
        <Card className="content-card">
        <Table 
          columns={columns} 
          dataSource={mockTasks}
          style={{ backgroundColor: '#FFFFFF' }}
        />
      </Card>
    </div>
  );
};

export default TasksList; 