import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SpeechProvider } from './hooks/useWebSpeech';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SpeechProvider>
      <App />
    </SpeechProvider>
  </React.StrictMode>
);
