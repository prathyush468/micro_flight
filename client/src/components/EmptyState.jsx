import React from 'react';
import { PlaneTakeoff } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = PlaneTakeoff,
  title = 'No records found',
  description = 'Try adjusting your search criteria or filters.',
  actionText = 'Search Flights',
  actionLink = '/flights',
  onActionClick = null
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)',
      margin: '20px 0'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--sky-blue-light)',
        color: 'var(--sky-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 20px' }}>
        {description}
      </p>

      {actionText && (
        onActionClick ? (
          <button onClick={onActionClick} className="btn btn-primary">
            {actionText}
          </button>
        ) : (
          <Link to={actionLink} className="btn btn-primary">
            {actionText}
          </Link>
        )
      )}
    </div>
  );
};

export default EmptyState;
