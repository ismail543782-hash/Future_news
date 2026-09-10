import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Future News Uncaught Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-lg p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {this.props.fallbackTitle || 'সাময়িক ত্রুটি দেখা দিয়েছে'}
              </h2>
              <p className="text-sm text-stone-600 mt-2">
                সংবাদ বা পেজটি লোড করার সময় একটি প্রযুক্তিগত ত্রুটি হয়েছে। নিচের বাটনে ক্লিক করে মূল পাতায় ফিরে যান।
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2 bg-stone-100 rounded text-left text-xs font-mono text-stone-600 overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>হোমপেজে ফিরে যান</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>রিলোড দিন</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
