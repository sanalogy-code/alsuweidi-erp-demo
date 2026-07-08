import { Component } from 'react'

// App-wide safety net. Before this existed, ANY uncaught error during render
// tore down the whole React tree and left a blank white page — recoverable only
// by a full browser refresh (the "goes white until I refresh" bug). Now a crash
// in one screen shows a recoverable card instead, and — crucially — resets
// automatically when you navigate to a different route (resetKey = pathname), so
// you can click away and keep working without a hard refresh.
//
// It also surfaces the actual error message on screen (fine for this demo), which
// turns an invisible intermittent crash into something we can read and fix.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, lastKey: props.resetKey }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  // Reset the moment the route changes, so navigation recovers on its own.
  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.lastKey) {
      return { error: null, lastKey: props.resetKey }
    }
    return null
  }

  componentDidCatch(error, info) {
    // Keep the stack in the console for debugging the deployed app.
    console.error('ErrorBoundary caught a render error:', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <div className="text-3xl mb-2">😕</div>
            <h1 className="text-lg font-semibold text-gray-800">This screen hit a snag</h1>
            <p className="text-sm text-gray-500 mt-2">
              Something on this page threw an error. Your data is safe (nothing is saved remotely in this demo).
              Use the buttons below or just open another module — navigating away clears it.
            </p>
            <pre className="mt-3 text-left text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-md p-2 overflow-x-auto whitespace-pre-wrap">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => this.setState({ error: null })}
                className="text-sm font-medium bg-brand text-white px-3 py-1.5 rounded-md hover:bg-brand-dark transition"
              >
                Try again
              </button>
              <button
                onClick={() => { window.location.href = '/home' }}
                className="text-sm font-medium text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition"
              >
                Go to Home
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              Seeing this a lot? Take a screenshot of the red text above — it names what broke.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
