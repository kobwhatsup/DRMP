import React, { useEffect, useState } from 'react';
import { CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';

interface CustomSuccessNotificationProps {
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

const CustomSuccessNotification: React.FC<CustomSuccessNotificationProps> = ({
  message,
  description,
  duration = 3000,
  onClose
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        zIndex: 9999,
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: '6px',
        border: '1px solid #d9d9d9',
        padding: '16px',
        minWidth: '320px',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <CheckCircleOutlined 
          style={{ 
            color: '#52c41a', 
            fontSize: '16px', 
            marginRight: '12px',
            marginTop: '2px'
          }} 
        />
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 500, 
            fontSize: '14px', 
            color: '#262626',
            marginBottom: description ? '4px' : 0
          }}>
            {message}
          </div>
          {description && (
            <div style={{ 
              fontSize: '14px', 
              color: '#595959',
              lineHeight: '1.5'
            }}>
              {description}
            </div>
          )}
        </div>
        <CloseOutlined
          style={{
            color: '#00000073',
            fontSize: '12px',
            cursor: 'pointer',
            marginLeft: '12px'
          }}
          onClick={handleClose}
        />
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomSuccessNotification;