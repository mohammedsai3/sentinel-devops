import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WarningOctagon, ArrowClockwise, House } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
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
    console.error('[Sentinel ErrorBoundary caught an error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = 'landing';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="pt-28 pb-20 max-w-2xl mx-auto px-4 sm:px-6 text-center font-sans">
          <div className="p-8 rounded-2xl bg-[#0f0f13] border border-rose-500/40 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <WarningOctagon size={32} weight="duotone" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Une erreur d'affichage est survenue</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1.5 max-w-md mx-auto">
                {this.state.error?.message || 'Erreur inattendue dans le rendu React.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowClockwise size={14} />
                <span>Actualiser la page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-mono font-bold text-zinc-950 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <House size={14} weight="bold" />
                <span>Retour au Portail</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
