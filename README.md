# WriterID Frontend

A React-based web application for writer identification and handwriting analysis. This application provides a comprehensive platform for managing datasets, training models, and executing writer identification tasks.

## Features

### 🔐 Authentication
- User registration and login
- Protected routes and role-based access
- Secure session management

### 📊 Dashboard
- Overview of system statistics
- Quick access to recent activities
- Performance metrics visualization

### 📁 Dataset Management
- Upload and manage handwriting datasets
- View dataset analysis and statistics
- Support for SAS (Statistical Analysis System) integration
- Dataset status tracking (Created, Processing, Completed, Failed)

### 🤖 Model Management
- Train custom writer identification models
- View model performance and accuracy metrics
- Model status monitoring
- Default model support

### ⚡ Task Execution
- Create and execute writer identification tasks
- Writer selection and filtering
- Query image upload and processing
- Real-time task status updates
- Comprehensive results viewing with color-coded accuracy:
  - 🟢 Green: ≥75% accuracy (Excellent)
  - 🟠 Orange: 50-74% accuracy (Good)
  - 🔴 Red: <50% accuracy (Poor)

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design (antd)
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Styling**: CSS with Ant Design theming
- **HTTP Client**: Axios (via services)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- WriterID Backend API running

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WriterID-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── Layout/          # Layout components (Sidebar, etc.)
│   └── ProtectedRoute.tsx
├── pages/               # Page components
│   ├── Auth/           # Authentication pages
│   ├── Dashboard/      # Dashboard page
│   ├── Datasets/       # Dataset management pages
│   ├── Models/         # Model management pages
│   └── Tasks/          # Task execution pages
├── services/           # API service layers
├── store/              # Redux store configuration
│   ├── slices/         # Redux slices
│   └── store.ts
├── theme/              # Theme configuration
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## API Integration

The application integrates with the WriterID Portal API. A Postman collection (`WriterID Portal API.postman_collection.json`) is included for API testing and documentation.

### Key API Endpoints

- **Authentication**: `/auth/login`, `/auth/register`
- **Datasets**: `/datasets/*`
- **Models**: `/models/*`
- **Tasks**: `/tasks/*`
- **Dashboard**: `/dashboard/stats`

## Usage Guide

### Getting Started
1. **Register/Login**: Create an account or login with existing credentials
2. **Upload Dataset**: Navigate to Datasets → New Dataset to upload handwriting samples
3. **Train Model** (Optional): Create a custom model or use the default model
4. **Create Task**: Go to Task Executor → Create Task to start writer identification

### Creating a Task
1. Select a completed dataset
2. Choose between default model or custom trained model
3. Select writers from the dataset (minimum 5 required)
4. Upload a query handwriting image
5. Execute the task

### Viewing Results
- Task details show comprehensive information including:
  - Writer identification results
  - Accuracy percentages with color coding
  - Query image display
  - Task metadata and status

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=WriterID Portal
```

### Theme Customization
Modify `src/theme/theme.ts` to customize the application theme and styling.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Use Redux Toolkit for state management
- Implement proper error handling
- Write meaningful commit messages
- Ensure responsive design compatibility

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of an academic research initiative for writer identification and handwriting analysis.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This application requires the WriterID Backend API to be running for full functionality. Ensure the backend service is properly configured and accessible.