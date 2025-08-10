import { Component, ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('Unhandled UI error', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-3">Bir şeyler ters gitti</h2>
          <p className="text-sm text-[var(--color-fg-muted)] mb-6">{this.state.error.message}</p>
          <button
            onClick={() => location.reload()}
            className="underline text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
