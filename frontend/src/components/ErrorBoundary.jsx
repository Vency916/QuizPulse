import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('QuizPulse ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-4">
          <div className="card-playful p-8 max-w-lg w-full bg-white border-2 border-slate-100 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFEBEB] text-[#FF7675] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Something went wrong!
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              QuizPulse encountered an unexpected issue while rendering this page. You can reload or return to the main lobby.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs font-mono text-slate-600 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="btn-3d-primary py-3 px-6 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-3d-secondary py-3 px-6 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
