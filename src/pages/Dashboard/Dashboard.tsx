import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, Space, Spin, Alert } from 'antd';
import { 
  FileOutlined, 
  DatabaseOutlined, 
  ExperimentOutlined, 
  PlayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardService, DashboardStats } from '../../services/dashboardService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State for dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);



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

      {/* Error Alert */}
      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-blue">
            <Statistic
              title={<span className="stats-title">Total Tasks</span>}
              value={loading ? 0 : stats?.totalTasks || 0}
              prefix={<PlayCircleOutlined className="stats-icon" />}
              valueStyle={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }}
              loading={loading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-green">
            <Statistic
              title={<span className="stats-title">Complete Tasks</span>}
              value={loading ? 0 : stats?.completedTasks || 0}
              prefix={<CheckCircleOutlined className="stats-icon" />}
              valueStyle={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-purple">
            <Statistic
              title={<span className="stats-title">Total Datasets</span>}
              value={loading ? 0 : stats?.totalDatasets || 0}
              prefix={<DatabaseOutlined className="stats-icon" />}
              valueStyle={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card stats-card-orange">
            <Statistic
              title={<span className="stats-title">Total Models</span>}
              value={loading ? 0 : stats?.totalModels || 0}
              prefix={<ExperimentOutlined className="stats-icon" />}
              valueStyle={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>



      <Row gutter={[16, 16]}>
        {/* Quick Actions */}
        <Col xs={24} lg={24}>
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
      </Row>
    </div>
  );
};

export default Dashboard; 