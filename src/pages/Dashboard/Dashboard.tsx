import React from 'react';
import { Row, Col, Card, Statistic, Timeline, Button, Tag, Space } from 'antd';
import { 
  FileOutlined, 
  DatabaseOutlined, 
  ExperimentOutlined, 
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockStats = {
    totalTaskExecutions: 127,
    totalCompletedTasks: 89,
    totalDatasets: 24,
    totalCustomModels: 15
  };

  const mockActivity = [
    {
      id: '1',
      type: 'task' as const,
      action: 'Task "Writer Classification" completed successfully',
      timestamp: '2 minutes ago',
      status: 'success' as const
    },
    {
      id: '2', 
      type: 'model' as const,
      action: 'Model "CNN Writer Classifier" training started',
      timestamp: '5 minutes ago',
      status: 'processing' as const
    },
    {
      id: '3',
      type: 'dataset' as const,
      action: 'Dataset "Handwriting Samples" uploaded',
      timestamp: '10 minutes ago',
      status: 'success' as const
    }
  ];

  // Navigation handlers for quick actions
  const handleCreateTaskClick = () => {
    navigate('/tasks', { state: { openCreateModal: true }, replace: false });
  };

  const handleUploadDatasetClick = () => {
    navigate('/datasets', { state: { openNewDatasetModal: true }, replace: false });
  };

  const handleCreateModelClick = () => {
    navigate('/models', { state: { openNewModelModal: true }, replace: false });
  };

  return (
    <div style={{ padding: '0' }}>
      <h1 className="page-title">
        Dashboard
      </h1>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-blue">
            <Statistic
              title={<span className="stats-title">Total Tasks</span>}
              value={mockStats.totalTaskExecutions}
              prefix={<PlayCircleOutlined className="stats-icon" />}
              valueStyle={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-green">
            <Statistic
              title={<span className="stats-title">Complete Tasks</span>}
              value={mockStats.totalCompletedTasks}
              prefix={<CheckCircleOutlined className="stats-icon" />}
              valueStyle={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-purple">
            <Statistic
              title={<span className="stats-title">Total Datasets</span>}
              value={mockStats.totalDatasets}
              prefix={<DatabaseOutlined className="stats-icon" />}
              valueStyle={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-orange">
            <Statistic
              title={<span className="stats-title">Total Models</span>}
              value={mockStats.totalCustomModels}
              prefix={<ExperimentOutlined className="stats-icon" />}
              valueStyle={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>



      <Row gutter={[16, 16]}>
        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card 
            title={<span className="card-title">Quick Actions</span>}
            className="full-height-card"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<FileOutlined />}
                className="primary-button full-width-button"
                onClick={handleCreateTaskClick}
              >
                Create New Task
              </Button>
              
              <Button 
                size="large" 
                icon={<DatabaseOutlined />}
                className="secondary-button full-width-button"
                onClick={handleUploadDatasetClick}
              >
                Upload Dataset
              </Button>
              
              <Button 
                size="large" 
                icon={<ExperimentOutlined />}
                className="secondary-button full-width-button"
                onClick={handleCreateModelClick}
              >
                Create New Model
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card 
            title={<span className="card-title">Recent Activity</span>}
            className="full-height-card"
          >
            <Timeline>
              {mockActivity.map((activity) => (
                <Timeline.Item
                  key={activity.id}
                                     dot={
                     activity.status === 'processing' ? (
                       <ClockCircleOutlined className="processing-icon" />
                     ) : (
                       <CheckCircleOutlined className="success-icon" />
                     )
                   }
                 >
                   <div>
                     <p className="activity-text">
                       {activity.action}
                     </p>
                     <div className="flex-column-center">
                       <Tag className={`status-tag-${activity.status}`}>
                         {activity.status.toUpperCase()}
                       </Tag>
                       <span className="activity-timestamp">
                         {activity.timestamp}
                       </span>
                     </div>
                   </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 