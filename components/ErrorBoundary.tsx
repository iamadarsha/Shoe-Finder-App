import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('SoleMate render error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#050507]">
          <h1 className="text-2xl md:text-3xl font-bold text-[#E8E8ED] font-heading mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-[#8888A0] font-body mb-8">
            Please reload the app to continue.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-[#7C5CFC] to-[#6B4EE8] shadow-[0_4px_20px_rgba(124,92,252,0.35)] font-heading"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
