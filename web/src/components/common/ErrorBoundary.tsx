"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

// ============================================================
// Error Boundary — コンポーネントエラーをキャッチして
// フォールバックUIを表示する
// ============================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  /** フォールバックUIをカスタマイズ */
  fallback?: ReactNode;
  /** エラー発生時のカスタムUIレンダラー */
  fallbackRender?: (props: { error: Error; resetError: () => void }) => ReactNode;
  /** エラー時のコールバック */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** セクション名（エラーメッセージに表示） */
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // カスタム fallbackRender
      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          resetError: this.resetError,
        });
      }

      // カスタム fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトフォールバックUI
      return (
        <div
          role="alert"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            textAlign: "center",
            minHeight: "200px",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            ⚠️
          </div>
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#1F2937",
                margin: "0 0 8px 0",
              }}
            >
              {this.props.label
                ? `${this.props.label}でエラーが発生しました`
                : "エラーが発生しました"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6B7280",
                margin: 0,
                maxWidth: "400px",
              }}
            >
              {this.state.error.message || "予期しないエラーが発生しました。"}
            </p>
          </div>
          <button
            onClick={this.resetError}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#FFFFFF",
              backgroundColor: "#4F46E5",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#4338CA")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#4F46E5")
            }
          >
            再試行
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
