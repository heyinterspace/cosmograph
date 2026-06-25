import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Safety net so a runtime failure in the 3D scene (a lost GPU context, a Three.js
// crash, a false-negative in the WebGL probe) shows the friendly fallback instead
// of unmounting the tree and leaving the visitor on a blank white screen.
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Visitor sees the fallback; this is just a console breadcrumb for debugging.
    console.error("Cosmograph crashed:", error, info.componentStack);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
