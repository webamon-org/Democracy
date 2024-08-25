import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './AuthContext'; // Ensure the path is correct
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports'; // Ensure the path is correct

// Configure Amplify with the provided AWS configuration
Amplify.configure(awsConfig);

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
