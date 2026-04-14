import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Placeholder integration point for Sentry frontend capture.
    console.error("frontend crash captured", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <div>Unexpected UI error. Please reload.</div>;
    }
    return this.props.children;
  }
}
