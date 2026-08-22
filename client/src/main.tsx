import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <main>
      <h1>GlobeTrotter</h1>
      <p>Personalized multi-city travel planning.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
