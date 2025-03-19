import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { store } from './store'
import theme from './theme'
import App from './App'
import './index.css'

// ErrorBoundary component to catch errors in the App component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper elevation={3} sx={{ m: 2, p: 3, bgcolor: '#ffebee' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom color="error">
              Fehler in der Anwendung
            </Typography>
            <Typography variant="body1" paragraph>
              Es gab ein Problem beim Rendern der Anwendung.
            </Typography>
            <Typography variant="body2" component="pre" sx={{ 
              maxWidth: '100%', 
              overflow: 'auto', 
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              mb: 2
            }}>
              {this.state.error?.toString() || 'Unbekannter Fehler'}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </Button>
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; margin: 20px; border: 1px solid #f5c6cb; border-radius: 4px; background-color: #f8d7da; color: #721c24">
      <h2>Schwerwiegender Rendering-Fehler</h2>
      <p>Die Anwendung konnte nicht gerendert werden. Fehler: ${error?.message || 'Unbekannter Fehler'}</p>
      <p>Details: ${error?.stack || 'Keine weiteren Details verfügbar'}</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer">
        Seite neu laden
      </button>
    </div>
  `;
} 