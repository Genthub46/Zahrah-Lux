import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl border border-red-100">
                        <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-sm text-stone-600 mb-4">The application encountered an error while loading this section.</p>
                        <div className="bg-stone-50 p-4 rounded text-xs font-mono text-stone-800 overflow-auto max-h-48 mb-6">
                            {this.state.error?.message}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-stone-800"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
