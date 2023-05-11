import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import "bootstrap/dist/css/bootstrap.min.css"
import App from "./Components/App.js"

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

