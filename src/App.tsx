import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateTask from './pages/Tasks/CreateTask';
import TaskExecutor from './pages/Tasks/TaskExecutor';
import ViewTaskResult from './pages/Tasks/ViewTaskResult';
import DatasetsList from './pages/Datasets/DatasetsList';
import NewDataset from './pages/Datasets/NewDataset';
import NewDatasetSAS from './pages/Datasets/NewDatasetSAS';
import ViewDatasetAnalysis from './pages/Datasets/ViewDatasetAnalysis';
import ModelsList from './pages/Models/ModelsList';
import NewModel from './pages/Models/NewModel';
import ViewModelResults from './pages/Models/ViewModelResults';

const { Content } = Layout;

const AppContent: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <Dashboard />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Tasks Routes */}
      <Route path="/tasks" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <TaskExecutor />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tasks/create" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <CreateTask />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tasks/result/:id" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <ViewTaskResult />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Datasets Routes */}
      <Route path="/datasets" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <DatasetsList />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/datasets/new" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <NewDataset />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/datasets/new-sas" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <NewDatasetSAS />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/datasets/analysis/:id" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <ViewDatasetAnalysis />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Models Routes */}
      <Route path="/models" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <ModelsList />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/models/new" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <NewModel />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/models/results/:id" element={
        <ProtectedRoute>
          <Layout className="main-layout">
            <Sidebar />
            <Layout className="main-layout">
              <Content className="content-area">
                <ViewModelResults />
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return <AppContent />;
}

export default App; 