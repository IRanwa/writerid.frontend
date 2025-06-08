import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: '#4F46E5', // Primary accent indigo
    colorBgContainer: '#FFFFFF', // Content background white
    colorBgLayout: '#F5F5F5', // Primary background light grey
    
    // Text colors
    colorText: '#1F2937', // Primary text dark charcoal
    colorTextSecondary: '#6B7280', // Secondary text light gray
    colorTextTertiary: '#6B7280',
    
    // Border colors
    colorBorder: '#E5E7EB', // Light gray borders
    colorBorderSecondary: '#E5E7EB',
    
    // Success colors
    colorSuccess: '#10B981',
    colorSuccessBg: '#D1FAE5',
    
    // Error colors
    colorError: '#EF4444',
    colorErrorBg: '#FEE2E2',
    
    // Warning colors (for processing status)
    colorWarning: '#8B5CF6',
    colorWarningBg: '#EDE9FE',
    
    // Font settings
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#F5F5F5',
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
    },
    Menu: {
      itemBg: '#FFFFFF',
      itemSelectedBg: '#4F46E5',
      itemHoverBg: '#4F46E5',
      itemSelectedColor: '#FFFFFF',
      itemHoverColor: '#FFFFFF',
    },
    Button: {
      primaryColor: '#FFFFFF',
      defaultColor: '#FFFFFF',
      defaultBg: '#4B5563',
      defaultBorderColor: '#4B5563',
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      colorBorder: '#E5E7EB',
    },
    Table: {
      colorBgContainer: '#FFFFFF',
      headerBg: '#F9FAFB',
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
    }
  }
}; 