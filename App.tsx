import React, { useEffect, useState } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState('Testando...');
  const [frontendStatus, setFrontendStatus] = useState('Frontend OK');

  useEffect(() => {
    // Test backend connection
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        setBackendStatus(`Backend OK: ${data.message}`);
      })
      .catch(error => {
        setBackendStatus(`Backend Error: ${error.message}`);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>CENA - Teste de Conexão</h1>
      <div>
        <p><strong>Frontend:</strong> {frontendStatus}</p>
        <p><strong>Backend:</strong> {backendStatus}</p>
      </div>
      {backendStatus.includes('OK') && (
        <div style={{ color: 'green', marginTop: '20px' }}>
          ✅ <strong>Conexão estabelecida com sucesso!</strong>
        </div>
      )}
    </div>
  );
}

export default App;