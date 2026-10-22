import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 32, fullPage = false }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '30px',
      color: 'var(--text-muted)'
    }}>
      <Loader2 size={size} className="spin-animation" color="var(--sky-blue)" />
      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%'
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
