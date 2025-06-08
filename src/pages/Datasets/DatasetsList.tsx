import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Dropdown, Modal, Form, Input, Radio, Alert, Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import { 
  PlusOutlined, 
  MoreOutlined, 
  EyeOutlined, 
  QuestionCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Key } from 'react';

const { Text, Paragraph } = Typography;

// Dataset interface
interface DatasetData {
  key: string;
  datasetId: string;
  name: string;
  status: 'created' | 'processed' | 'failed' | 'processing';
  createdAt: string;
  size: string;
  samples: number;
}

const DatasetsList: React.FC = () => {
  const location = useLocation();
  const [selectedDatasetKey, setSelectedDatasetKey] = useState<Key | null>(null);
  const [isNewDatasetModalOpen, setIsNewDatasetModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGenerateUrlModalOpen, setIsGenerateUrlModalOpen] = useState(false);
  const [newDatasetForm] = Form.useForm();
  const [showSasUrl, setShowSasUrl] = useState(false);
  const [sasUrl, setSasUrl] = useState('');

  // Auto-open modal when navigated from Dashboard
  useEffect(() => {
    if (location.state?.openNewDatasetModal) {
      setIsNewDatasetModalOpen(true);
    }
  }, [location]);

  // Mock dataset data
  const datasetData: DatasetData[] = [
    {
      key: '1',
      datasetId: 'a1397625-1565-4642-8636-1ddd8df8b0d1',
      name: 'Historical Dataset',
      status: 'processed',
      createdAt: '2024-01-15 14:30:22',
      size: '245.6 MB',
      samples: 1250
    },
    {
      key: '2',
      datasetId: 'a1397625-1565-4642-8636-1ddd8df8b0d1',
      name: 'Modern Dataset',
      status: 'failed',
      createdAt: '2024-01-14 09:15:18',
      size: '189.3 MB',
      samples: 980
    },
    {
      key: '3',
      datasetId: 'a1397625-1565-4642-8636-1ddd8df8b0d1',
      name: 'Mixed Dataset',
      status: 'processing',
      createdAt: '2024-01-16 11:45:33',
      size: '312.8 MB',
      samples: 1567
    },
    {
      key: '4',
      datasetId: 'a1397625-1565-4642-8636-1ddd8df8b0d1',
      name: 'Custom Dataset',
      status: 'created',
      createdAt: '2024-01-16 16:20:15',
      size: '198.4 MB',
      samples: 892
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'default';
      case 'processed':
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
      case 'created':
        return 'Created';
      case 'processed':
        return 'Processed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      default:
        return 'Unknown';
    }
  };

  const getSelectedDataset = () => {
    return datasetData.find(dataset => dataset.key === selectedDatasetKey);
  };

  const getActionItems = (): MenuProps['items'] => {
    const selectedDataset = getSelectedDataset();
    
    if (!selectedDataset) {
      return [
        {
          key: 'view',
          label: 'View Details',
          icon: <EyeOutlined />,
          disabled: true,
        },

        {
          key: 'executeAnalysis',
          label: 'Execute Analysis',
          icon: <PlayCircleOutlined />,
          disabled: true,
        },
        {
          key: 'generateUrl',
          label: 'Generate Access URL',
          icon: <LinkOutlined />,
          disabled: true,
        },
      ];
    }

    const items: MenuProps['items'] = [
      // View Details - available for any state
      {
        key: 'view',
        label: 'View Details',
        icon: <EyeOutlined />,
      },
    ];

    // Execute Analysis - only if in created state
    if (selectedDataset.status === 'created') {
      items.push({
        key: 'executeAnalysis',
        label: 'Execute Analysis',
        icon: <PlayCircleOutlined />,
      });
    }

    // Generate Access URL - for created, failed, or processed state
    if (['created', 'failed', 'processed'].includes(selectedDataset.status)) {
      items.push({
        key: 'generateUrl',
        label: 'Generate Access URL',
        icon: <LinkOutlined />,
      });
    }

    return items;
  };

  const handleActionClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'view':
        setIsDetailsModalOpen(true);
        break;
      case 'executeAnalysis':
        handleExecuteAnalysis();
        break;
      case 'generateUrl':
        setIsGenerateUrlModalOpen(true);
        break;
    }
  };

  const handleExecuteAnalysis = () => {
    console.log('Executing analysis for dataset:', selectedDatasetKey);
    // In real implementation, this would trigger the analysis API
    // For now, just show a success message
    Modal.success({
      title: 'Analysis Started',
      content: 'Dataset analysis has been initiated. You will be notified when it completes.',
    });
  };

  const handleCreateDataset = () => {
    newDatasetForm.validateFields().then((values) => {
      console.log('Creating dataset:', values);
      
      // Mock SAS URL - in real implementation this would come from backend
      const mockSasUrl = `https://yourstorageaccount.blob.core.windows.net/datasets/${values.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=mockSignature123`;
      
      setSasUrl(mockSasUrl);
      setShowSasUrl(true);
    });
  };

  const handleNewDatasetModalClose = () => {
    setIsNewDatasetModalOpen(false);
    setShowSasUrl(false);
    setSasUrl('');
    newDatasetForm.resetFields();
  };

  const handleCopySasUrl = () => {
    navigator.clipboard.writeText(sasUrl);
  };

  const columns = [
    {
      title: '',
      key: 'selection',
      width: 50,
      render: (_: any, record: DatasetData) => (
        <Radio
          checked={selectedDatasetKey === record.key}
          onChange={() => setSelectedDatasetKey(record.key)}
        />
      ),
    },
    {
      title: 'Dataset ID',
      dataIndex: 'datasetId',
      key: 'datasetId',
      render: (id: string) => (
        <code className="task-id">{id}</code>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="dataset-name">{name}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="status-tag">
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Samples',
      dataIndex: 'samples',
      key: 'samples',
      render: (samples: number) => samples.toLocaleString(),
    },
  ];

  const openGuide = () => {
    window.open('https://example.com/dataset-upload-guide', '_blank');
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex-row-between">
        <h1 className="page-title">Datasets</h1>
        <div className="header-actions">
          <Button 
            icon={<QuestionCircleOutlined />}
            onClick={openGuide}
          >
            Guide to Upload Dataset
          </Button>
          <Dropdown
            menu={{
              items: getActionItems(),
              onClick: handleActionClick,
            }}
            placement="bottomRight"
            disabled={!selectedDatasetKey}
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
            onClick={() => setIsNewDatasetModalOpen(true)}
          >
            New Dataset
          </Button>
        </div>
      </div>

      {/* Datasets Table */}
      <div className="task-table-container">
        <Table
          columns={columns}
          dataSource={datasetData}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} datasets`,
            pageSize: 10,
          }}
          className="task-table"
          size="middle"
        />
      </div>

      {/* New Dataset Modal */}
      <Modal
        title={showSasUrl ? "Dataset Created Successfully" : "Create New Dataset"}
        open={isNewDatasetModalOpen}
        onCancel={handleNewDatasetModalClose}
        footer={
          showSasUrl ? [
            <Button key="close" type="primary" onClick={handleNewDatasetModalClose}>
              Close
            </Button>
          ] : [
            <Button key="cancel" onClick={handleNewDatasetModalClose}>
              Cancel
            </Button>,
            <Button 
              key="create" 
              type="primary" 
              onClick={handleCreateDataset}
              style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            >
              Create Dataset
            </Button>
          ]
        }
        width={600}
        maskClosable={false}
      >
        {showSasUrl ? (
          <div style={{ marginTop: '20px' }}>
            <Alert
              message="Dataset Created Successfully"
              description="Your dataset has been created. Use the SAS URL below to upload your dataset files."
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
              style={{ marginBottom: '20px' }}
            />
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                Access URL (SAS) for Dataset Upload:
              </Text>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '6px',
                border: '1px solid #d9d9d9',
                position: 'relative'
              }}>
                <Paragraph 
                  code 
                  copyable={{ 
                    icon: <CopyOutlined />,
                    tooltips: ['Copy URL', 'Copied!'],
                    onCopy: handleCopySasUrl
                  }}
                  style={{ 
                    margin: 0, 
                    wordBreak: 'break-all',
                    fontSize: '12px'
                  }}
                >
                  {sasUrl}
                </Paragraph>
              </div>
            </div>
            
            <Alert
              message="Important"
              description="This SAS URL is valid for uploading files to your dataset. Please save it securely as it will be needed for dataset upload operations."
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </div>
        ) : (
          <Form
            form={newDatasetForm}
            layout="vertical"
            style={{ marginTop: '20px' }}
          >
            <Form.Item
              label={<span style={{ fontWeight: 600 }}><span style={{ color: '#ff4d4f' }}>*</span> Dataset Name</span>}
              name="name"
              required={false}
              rules={[{ required: true, message: 'Please enter a dataset name!' }]}
            >
              <Input 
                placeholder="Enter dataset name" 
                size="large"
                style={{ borderRadius: '6px' }}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#4F46E5' }} />
            Dataset Details
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
        {getSelectedDataset() && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <strong>Dataset ID:</strong> 
              <code style={{ marginLeft: '8px', fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                {getSelectedDataset()?.datasetId}
              </code>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Name:</strong> <span style={{ marginLeft: '8px' }}>{getSelectedDataset()?.name}</span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Status:</strong> 
              <Tag color={getStatusColor(getSelectedDataset()?.status || '')} style={{ marginLeft: '8px' }}>
                {getStatusText(getSelectedDataset()?.status || '')}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Created At:</strong> <span style={{ marginLeft: '8px' }}>{getSelectedDataset()?.createdAt}</span>
            </div>
            
            {/* Analysis Details - only show for processed datasets */}
            {getSelectedDataset()?.status === 'processed' && (
              <>
                <div style={{ 
                  borderTop: '1px solid #e5e7eb', 
                  marginTop: '20px', 
                  paddingTop: '16px',
                  marginBottom: '16px' 
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '14px', fontWeight: 600 }}>
                    Analysis Details
                  </h4>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Maximum Sample Count:</strong> <span style={{ marginLeft: '8px' }}>145</span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Minimum Sample Count:</strong> <span style={{ marginLeft: '8px' }}>23</span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Number of Writers:</strong> <span style={{ marginLeft: '8px' }}>12</span>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Generate Access URL Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LinkOutlined style={{ color: '#4F46E5' }} />
            Generate Access URL
          </div>
        }
        open={isGenerateUrlModalOpen}
        onCancel={() => setIsGenerateUrlModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsGenerateUrlModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="generate" 
            type="primary" 
            onClick={() => {
              const selectedDataset = getSelectedDataset();
              if (selectedDataset) {
                const newSasUrl = `https://yourstorageaccount.blob.core.windows.net/datasets/${selectedDataset.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=mockSignature${Date.now()}`;
                setSasUrl(newSasUrl);
                setIsGenerateUrlModalOpen(false);
                
                Modal.success({
                  title: 'Access URL Generated',
                  content: (
                    <div>
                      <p>Access URL has been generated successfully:</p>
                      <div style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '12px', 
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9',
                        marginTop: '12px'
                      }}>
                        <Paragraph 
                          code 
                          copyable={{ 
                            tooltips: ['Copy URL', 'Copied!']
                          }}
                          style={{ 
                            margin: 0, 
                            wordBreak: 'break-all',
                            fontSize: '12px'
                          }}
                        >
                          {newSasUrl}
                        </Paragraph>
                      </div>
                    </div>
                  ),
                  width: 600,
                });
              }
            }}
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
          >
            Generate URL
          </Button>
        ]}
        width={500}
      >
        {getSelectedDataset() && (
          <div style={{ marginTop: '20px' }}>
            <Alert
              message="Generate New Access URL"
              description="This will create a new secure access URL for uploading or downloading dataset files."
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '12px', 
              borderRadius: '6px', 
              marginTop: '12px',
              border: '1px solid #e5e7eb' 
            }}>
              <div><strong>Dataset:</strong> {getSelectedDataset()?.name}</div>
              <div><strong>Status:</strong> 
                <Tag color={getStatusColor(getSelectedDataset()?.status || '')} style={{ marginLeft: '8px' }}>
                  {getStatusText(getSelectedDataset()?.status || '')}
                </Tag>
              </div>
              <div><strong>Size:</strong> {getSelectedDataset()?.size}</div>
            </div>
            
            <Alert
              message="Note"
              description="The generated URL will be valid for 24 hours and will provide secure access to your dataset files."
              type="warning"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DatasetsList; 