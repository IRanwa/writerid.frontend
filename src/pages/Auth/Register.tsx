import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (_values: RegisterFormData) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock registration success
      setSuccess(true);
      form.resetFields();
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Row justify="center" style={{ width: '100%', maxWidth: '1200px' }}>
          <Col xs={24} sm={20} md={16} lg={12} xl={10}>
            <Card
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                borderRadius: '12px',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <div style={{ padding: '40px 20px' }}>
                <div style={{ 
                  fontSize: '48px', 
                  color: '#52c41a', 
                  marginBottom: '16px' 
                }}>
                  ✓
                </div>
                <Title level={3} style={{ color: '#52c41a', marginBottom: '16px' }}>
                  Registration Successful!
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Your account has been created successfully.<br />
                  Redirecting to login page...
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%', maxWidth: '1200px' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            style={{
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              borderRadius: '12px',
              border: 'none'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2} style={{ color: '#4F46E5', marginBottom: '8px' }}>
                Create Account
              </Title>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleRegister}
              size="large"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                      { required: true, message: 'Please enter your first name!' },
                      { min: 2, message: 'First name must be at least 2 characters!' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#8B9DC3' }} />}
                      placeholder="First name"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      { required: true, message: 'Please enter your last name!' },
                      { min: 2, message: 'Last name must be at least 2 characters!' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#8B9DC3' }} />}
                      placeholder="Last name"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email address!' },
                  { type: 'email', message: 'Please enter a valid email address!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#8B9DC3' }} />}
                  placeholder="Enter your email address"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number!'
                  }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#8B9DC3' }} />}
                  placeholder="Create a strong password"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#8B9DC3' }} />}
                  placeholder="Confirm your password"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '16px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    backgroundColor: '#4F46E5',
                    borderColor: '#4F46E5'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Text type="secondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#4F46E5', 
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Sign in here
                </Link>
              </Text>
            </div>

            <div style={{ 
              marginTop: '24px', 
              padding: '12px', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '8px',
              border: '1px solid #e0f2fe'
            }}>
              <Text style={{ fontSize: '12px', color: '#0369a1' }}>
                <strong>Password Requirements:</strong><br />
                • At least 8 characters long<br />
                • Contains uppercase and lowercase letters<br />
                • Contains at least one number
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register; 