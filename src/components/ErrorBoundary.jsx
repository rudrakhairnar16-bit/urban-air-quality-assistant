import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Telemetry Error Boundary Caught]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="bento-card" style={{
            maxWidth: '560px',
            textAlign: 'center',
            alignItems: 'center',
            padding: '2.5rem 2rem',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            background: 'rgba(244, 63, 94, 0.04)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-capsule)',
              background: 'rgba(244, 63, 94, 0.15)',
              color: 'var(--accent-rose)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: '1rem',
              fontFamily: '-apple-system, monospace'
            }}>
              TELEMETRY EXCEPTION CAUGHT
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Telemetry Render Exception
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem', maxWidth: '420px' }}>
              The dynamic multi-agent prediction model encountered an unexpected data structure. Your local settings and calibrated sensors have been preserved.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={this.handleReset}
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}
              >
                Reset Dashboard View
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.location.reload()}
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}
              >
                Reload Application
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left', width: '100%', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>View Diagnostic Stack</summary>
                <pre style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  overflowX: 'auto',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-rose)'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

