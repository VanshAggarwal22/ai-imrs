import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '4rem', margin: '0', color: 'var(--text-primary)' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--accent-blue)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '500'
                }}
            >
                <Home size={18} />
                Back to Dashboard
            </Link>
        </div>
    );
};

export default NotFound;
