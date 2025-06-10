import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Radio,
  Dropdown,
  Modal,
  Form,
  Input,
  Tag,
  Alert,
  Typography,
  Space,
  message,
  Spin,
} from 'antd';
import type { MenuProps, TableColumnsType } from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  LinkOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDatasets, createDataset, deleteDataset, startAnalysis } from '../../store/slices/datasetsSlice';
import datasetService from '../../services/datasetService';

const { Paragraph, Text } = Typography;

const DatasetsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { datasets, loading, error } = useAppSelector((state) => state.datasets);
  
  const [selectedDatasetKey, setSelectedDatasetKey] = useState<string | null>(null);
  const [isNewDatasetModalOpen, setIsNewDatasetModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGenerateUrlModalOpen, setIsGenerateUrlModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [loadingAnalysisResults, setLoadingAnalysisResults] = useState(false);
  const [newDatasetForm] = Form.useForm();
  const [showSasUrl, setShowSasUrl] = useState(false);
  const [sasUrl, setSasUrl] = useState('');

  // Auto-open modal when navigated from Dashboard
  useEffect(() => {
    if (location.state?.openNewDatasetModal) {
      setIsNewDatasetModalOpen(true);
    }
  }, [location]);

  // Fetch datasets on component mount
  useEffect(() => {
    dispatch(fetchDatasets());
  }, [dispatch]);

  // Handle any fetch errors
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const refreshDatasets = async () => {
    try {
      await dispatch(fetchDatasets()).unwrap();
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

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

  const getSelectedDataset = () => {
    return datasets.find(dataset => dataset.id === selectedDatasetKey);
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
        {
          key: 'remove',
          label: 'Remove Dataset',
          icon: <DeleteOutlined />,
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

    // Execute Analysis - only if in Created state (status = 0)
    if (selectedDataset.status === 0) {
      items.push({
        key: 'executeAnalysis',
        label: 'Execute Analysis',
        icon: <PlayCircleOutlined />,
      });
    }

    // Generate Access URL - for Created, Completed, or Failed state
    if ([0, 2, 3].includes(selectedDataset.status)) {
      items.push({
        key: 'generateUrl',
        label: 'Generate Access URL',
        icon: <LinkOutlined />,
      });
    }

    // Remove Dataset - for Created, Completed, or Failed state (not Processing)
    if ([0, 2, 3].includes(selectedDataset.status)) {
      items.push({
        key: 'remove',
        label: 'Remove Dataset',
        icon: <DeleteOutlined />,
        danger: true,
      });
    }

    return items;
  };

  const handleActionClick = ({ key }: { key: string }) => {
    console.log('Action clicked:', key);
    console.log('Selected dataset key:', selectedDatasetKey);
    console.log('Selected dataset object:', getSelectedDataset());
    
    switch (key) {
      case 'view':
        console.log('Opening details modal');
        setIsDetailsModalOpen(true);
        
        // Fetch analysis results if dataset is completed (status = 2)
        const selectedDataset = getSelectedDataset();
        if (selectedDataset && selectedDataset.status === 2) {
          setLoadingAnalysisResults(true);
          setAnalysisResults(null);
          
          datasetService.getAnalysisResults(selectedDataset.id)
            .then((results) => {
              console.log('Analysis results fetched:', results);
              setAnalysisResults(results);
            })
            .catch((error) => {
              console.error('Failed to fetch analysis results:', error);
              setAnalysisResults(null);
              message.error('Failed to load analysis results');
            })
            .finally(() => {
              setLoadingAnalysisResults(false);
            });
        } else {
          setAnalysisResults(null);
          setLoadingAnalysisResults(false);
        }
        break;
      case 'executeAnalysis':
        handleExecuteAnalysis();
        break;
      case 'generateUrl':
        setIsGenerateUrlModalOpen(true);
        break;
      case 'remove':
        handleRemoveDataset();
        break;
    }
  };

  const handleExecuteAnalysis = async () => {
    if (!selectedDatasetKey) return;
    
    try {
      await dispatch(startAnalysis(selectedDatasetKey)).unwrap();
      message.success('Analysis started successfully');
      await refreshDatasets(); // Refresh the list
    } catch (error: any) {
      console.error('Error starting analysis:', error);
      message.error(error.message || 'Failed to start analysis');
    }
  };

  const handleRemoveDataset = () => {
    const selectedDataset = getSelectedDataset();
    if (!selectedDataset) return;

    Modal.confirm({
      title: 'Remove Dataset',
      content: `Are you sure you want to remove the dataset "${selectedDataset.name}"? This action cannot be undone.`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteDataset(selectedDataset.id)).unwrap();
          message.success('Dataset removed successfully');
          setSelectedDatasetKey(null);
          await refreshDatasets(); // Refresh the list
        } catch (error: any) {
          console.error('Error removing dataset:', error);
          message.error(error.message || 'Failed to remove dataset');
        }
      },
    });
  };

  const handleCreateDataset = async () => {
    try {
      const values = await newDatasetForm.validateFields();
      console.log('Creating dataset:', values);
      
      const result = await dispatch(createDataset({ name: values.name })).unwrap();
      console.log('Dataset created:', result);
      
      // Show the SAS URL
      setSasUrl(result.sasUrl);
      setShowSasUrl(true);
      
      // Refresh datasets list
      await refreshDatasets();
    } catch (error: any) {
      console.error('Error creating dataset:', error);
      message.error(error.message || 'Failed to create dataset');
    }
  };

  const handleNewDatasetModalClose = () => {
    setIsNewDatasetModalOpen(false);
    setShowSasUrl(false);
    setSasUrl('');
    newDatasetForm.resetFields();
  };

  const handleCopySasUrl = () => {
    navigator.clipboard.writeText(sasUrl);
    message.success('SAS URL copied to clipboard');
  };

  const columns: TableColumnsType<any> = [
    {
      title: '',
      key: 'select',
      width: 50,
      render: (_, record) => (
        <Radio
          checked={selectedDatasetKey === record.id}
          onChange={() => setSelectedDatasetKey(record.id)}
        />
      ),
    },
    {
      title: 'Dataset ID',
      dataIndex: 'id',
      key: 'id',
      width: 300,
      render: (text: string) => (
        <span className="task-id">{text}</span>
      ),
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
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string | null) => date ? new Date(date).toLocaleString() : 'N/A',
    },
  ];

  const openGuide = () => {
    setIsGuideModalOpen(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ margin: 0 }}>Datasets</h2>
          <Space>
            <Button 
              icon={<QuestionCircleOutlined />}
              onClick={openGuide}
            >
              Guide to Upload Dataset
            </Button>
            <Dropdown
              menu={{ 
                items: getActionItems(),
                onClick: handleActionClick
              }}
              trigger={['click']}
              disabled={!selectedDatasetKey}
            >
              <Button 
                icon={<MoreOutlined />}
                disabled={!selectedDatasetKey}
              >
                Actions
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsNewDatasetModalOpen(true)}
            >
              New Dataset
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={datasets}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </Card>

      {/* New Dataset Modal */}
      <Modal
        title="Create New Dataset"
        open={isNewDatasetModalOpen}
        onCancel={handleNewDatasetModalClose}
        footer={showSasUrl ? [
          <Button key="close" type="primary" onClick={handleNewDatasetModalClose}>
            Close
          </Button>
        ] : [
          <Button key="cancel" onClick={handleNewDatasetModalClose}>
            Cancel
          </Button>,
          <Button key="create" type="primary" onClick={handleCreateDataset}>
            Create Dataset
          </Button>
        ]}
        width={600}
      >
        {!showSasUrl ? (
          <Form form={newDatasetForm} layout="vertical" style={{ marginTop: '20px' }}>
            <Form.Item
              name="name"
              label="Dataset Name"
              rules={[
                { required: true, message: 'Please enter a dataset name' },
                { min: 3, message: 'Dataset name must be at least 3 characters' },
                { max: 50, message: 'Dataset name must not exceed 50 characters' }
              ]}
            >
              <Input placeholder="Enter a descriptive name for your dataset" />
            </Form.Item>
          </Form>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <Alert
              message="Dataset Created Successfully!"
              description="Your dataset has been created. Use the SAS URL below to upload your files."
              type="success"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong>SAS URL for file upload:</Text>
            </div>
            
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '6px',
              border: '1px solid #d9d9d9',
              marginBottom: '16px'
            }}>
              <Paragraph 
                code 
                copyable={{ 
                  text: sasUrl,
                  onCopy: handleCopySasUrl,
                  tooltips: ['Copy SAS URL', 'Copied!']
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
            
            <Alert
              message="Important Instructions"
              description={
                <div>
                  <p>• This URL is temporary and will expire after a certain period</p>
                  <p>• Use this URL with Azure Storage Explorer or similar tools to upload your dataset files</p>
                  <p>• Need help? <Button type="link" style={{ padding: 0 }} onClick={openGuide}>Guide to Upload Dataset</Button></p>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOutlined style={{ color: '#4F46E5' }} />
            Dataset Details
          </div>
        }
        open={isDetailsModalOpen}
        onCancel={() => setIsDetailsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailsModalOpen(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {getSelectedDataset() && (
          <div style={{ marginTop: '20px' }}>
            {/* Basic Information */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '14px', fontWeight: 600 }}>
                Basic Information
              </h4>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb' 
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>ID:</strong> <span>{getSelectedDataset()?.id}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Name:</strong> <span>{getSelectedDataset()?.name}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Status:</strong> 
                  <Tag color={getStatusColor(getSelectedDataset()?.status || 0)} style={{ marginLeft: '8px' }}>
                    {getStatusText(getSelectedDataset()?.status || 0)}
                  </Tag>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Created:</strong> <span>{new Date(getSelectedDataset()?.createdAt || '').toLocaleString()}</span>
                </div>
                <div>
                  <strong>Updated:</strong> <span>{getSelectedDataset()?.updatedAt ? new Date(getSelectedDataset()?.updatedAt || '').toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {/* Analysis Results - only show for completed datasets (status = 2) */}
            {getSelectedDataset()?.status === 2 && (
              <>
                <div style={{ 
                  borderTop: '1px solid #e5e7eb', 
                  marginTop: '20px', 
                  paddingTop: '16px',
                  marginBottom: '16px' 
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', fontSize: '14px', fontWeight: 600 }}>
                    Analysis Results
                  </h4>
                </div>
                
                {loadingAnalysisResults ? (
                   <div style={{ textAlign: 'center', padding: '20px' }}>
                     <Spin size="small" />
                     <div style={{ marginTop: '8px', color: '#8c8c8c' }}>Loading analysis results...</div>
                   </div>
                 ) : analysisResults ? (
                   <div style={{ marginBottom: '16px' }}>
                     {/* Summary Statistics */}
                     <div style={{ 
                       backgroundColor: '#f0f9ff', 
                       padding: '16px', 
                       borderRadius: '8px',
                       border: '1px solid #bae6fd',
                       marginBottom: '16px'
                     }}>
                       <h5 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '13px', fontWeight: 600 }}>
                         Dataset Summary
                       </h5>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                         <div>
                           <strong>Number of Writers:</strong> <span>{analysisResults.num_writers || 'N/A'}</span>
                         </div>
                         <div>
                           <strong>Total Writers Found:</strong> <span>{analysisResults.writer_names?.length || 'N/A'}</span>
                         </div>
                         <div>
                           <strong>Min Samples:</strong> <span>{analysisResults.min_samples || 'N/A'}</span>
                         </div>
                         <div>
                           <strong>Max Samples:</strong> <span>{analysisResults.max_samples || 'N/A'}</span>
                         </div>
                       </div>
                     </div>

                     {/* Writer Names */}
                     {analysisResults.writer_names && analysisResults.writer_names.length > 0 && (
                       <div style={{ 
                         backgroundColor: '#f8fafc', 
                         padding: '16px', 
                         borderRadius: '8px',
                         border: '1px solid #e2e8f0',
                         marginBottom: '16px'
                       }}>
                         <h5 style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '13px', fontWeight: 600 }}>
                           Writers Found ({analysisResults.writer_names.length})
                         </h5>
                         <div style={{ 
                           display: 'flex', 
                           flexWrap: 'wrap', 
                           gap: '6px',
                           maxHeight: '120px',
                           overflowY: 'auto'
                         }}>
                           {analysisResults.writer_names.map((writer: string, index: number) => (
                             <Tag 
                               key={index} 
                               color="blue" 
                               style={{ margin: '2px', fontSize: '11px' }}
                             >
                               {writer}
                             </Tag>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Writer Sample Counts */}
                     {analysisResults.writer_counts && Object.keys(analysisResults.writer_counts).length > 0 && (
                       <div style={{ 
                         backgroundColor: '#fefce8', 
                         padding: '16px', 
                         borderRadius: '8px',
                         border: '1px solid #fde047',
                         marginBottom: '16px'
                       }}>
                         <h5 style={{ margin: '0 0 12px 0', color: '#a16207', fontSize: '13px', fontWeight: 600 }}>
                           Sample Counts per Writer
                         </h5>
                         <div style={{ 
                           maxHeight: '200px', 
                           overflowY: 'auto',
                           fontSize: '12px'
                         }}>
                           <div style={{ 
                             display: 'grid', 
                             gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                             gap: '8px'
                           }}>
                             {Object.entries(analysisResults.writer_counts).map(([writer, count]: [string, any]) => (
                               <div 
                                 key={writer} 
                                 style={{ 
                                   backgroundColor: '#ffffff', 
                                   padding: '8px', 
                                   borderRadius: '4px',
                                   border: '1px solid #e5e7eb',
                                   textAlign: 'center'
                                 }}
                               >
                                 <div style={{ fontWeight: 600, color: '#374151' }}>{writer}</div>
                                 <div style={{ color: '#6b7280', fontSize: '11px' }}>{count} samples</div>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     )}


                   </div>
                 ) : (
                   <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                     No analysis results available
                   </div>
                 )}
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
            onClick={async () => {
              const selectedDataset = getSelectedDataset();
              if (selectedDataset) {
                try {
                  const result = await datasetService.generateSasUrl(selectedDataset.id);
                  setSasUrl(result.sasUrl);
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
                            {result.sasUrl}
                          </Paragraph>
                        </div>
                      </div>
                    ),
                    width: 600,
                  });
                } catch (error: any) {
                  console.error('Error generating SAS URL:', error);
                  message.error(error.message || 'Failed to generate access URL');
                }
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
                <Tag color={getStatusColor(getSelectedDataset()?.status || 0)} style={{ marginLeft: '8px' }}>
                  {getStatusText(getSelectedDataset()?.status || 0)}
                </Tag>
              </div>
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

      {/* Dataset Upload Guide Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QuestionCircleOutlined style={{ color: '#4F46E5' }} />
            Guide to Upload Dataset using SAS URL
          </div>
        }
        open={isGuideModalOpen}
        onCancel={() => setIsGuideModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsGuideModalOpen(false)}>
            Got it!
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ marginTop: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Introduction */}
          <Alert
            message="What is a SAS URL?"
            description="A SAS (Shared Access Signature) URL is a secure way to upload files to cloud storage without exposing your account credentials. It provides temporary, limited access to upload your dataset files."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          {/* Step-by-step Guide */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1F2937', marginBottom: '16px' }}>📋 Step-by-Step Upload Process</h3>
            
            {/* Step 1 */}
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ color: '#4F46E5', marginBottom: '12px' }}>Step 1: Create a New Dataset</h4>
              <p style={{ marginBottom: '12px' }}>Click the "New Dataset" button and enter a descriptive name for your dataset. After creation, you'll receive a unique SAS URL.</p>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ color: '#4F46E5', marginBottom: '12px' }}>Step 2: Copy Your SAS URL</h4>
              <p style={{ marginBottom: '12px' }}>After creating the dataset, copy the generated SAS URL. This URL is temporary and secure for uploading your files.</p>
              
              <Alert
                message="Important"
                description="Save this URL immediately! It's only shown once and will expire after a certain time period."
                type="warning"
                showIcon
                style={{ margin: '12px 0' }}
              />
            </div>

            {/* Step 3 */}
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ color: '#4F46E5', marginBottom: '12px' }}>Step 3: Upload Using Azure Storage Explorer</h4>
              <p style={{ marginBottom: '12px' }}>Use Microsoft Azure Storage Explorer or any compatible tool to upload your files:</p>
              
              <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>Download and install <a href="https://azure.microsoft.com/en-us/products/storage/storage-explorer/" target="_blank" rel="noopener noreferrer">Azure Storage Explorer</a></li>
                <li style={{ marginBottom: '8px' }}>Open Azure Storage Explorer</li>
                <li style={{ marginBottom: '8px' }}>Click "Add an account" → "Use a shared access signature (SAS) URI"</li>
                <li style={{ marginBottom: '8px' }}>Paste your SAS URL and click "Next"</li>
                <li style={{ marginBottom: '8px' }}>Navigate to the connected container and upload your files</li>
              </ol>
            </div>
          </div>

          {/* Organization Tips */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f', marginBottom: '16px' }}>
              <h4 style={{ color: '#52c41a', marginBottom: '12px' }}>Organization Tips</h4>
              <p style={{ marginBottom: '12px' }}>Create folders for different writers with multiple samples:</p>
              <Alert
                message="Important Note"
                description="The folder name will be used as the writer name/label in the system. Make sure to use descriptive and consistent folder names."
                type="info"
                showIcon
                style={{ margin: '12px 0' }}
              />
              <div style={{ 
                backgroundColor: '#f0f0f0', 
                padding: '12px', 
                borderRadius: '4px', 
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.6'
              }}>
                📁 dataset/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;📁 writer_001/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 sample_001.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 sample_002.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 sample_003.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 sample_004.jpg<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 sample_005.jpg<br />
                &nbsp;&nbsp;&nbsp;&nbsp;📁 writer_002/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 handwriting_001.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 handwriting_002.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 handwriting_003.jpg<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 handwriting_004.jpg<br />
                &nbsp;&nbsp;&nbsp;&nbsp;📁 writer_003/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 text_sample_01.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 text_sample_02.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 text_sample_03.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 signature_01.jpg<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 signature_02.jpg<br />
                &nbsp;&nbsp;&nbsp;&nbsp;📁 writer_004/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 document_page1.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 document_page2.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 letter_sample.jpg<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 notes_001.png<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 notes_002.png
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DatasetsList; 