import React, { useState, useEffect } from 'react';

// Base URL للـ API
const API_BASE_URL = 'https://power-ms-trading-pro-1.onrender.com';

function App() {
  const [activationCode, setActivationCode] = useState('');
  const [message, setMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [settings, setSettings] = useState({ pairs: [], strategies: [] });
  const [isActivated, setIsActivated] = useState(false);
  const [botStatus, setBotStatus] = useState('stopped');
  const [balances, setBalances] = useState([]);

  const activate = async () => {
    const res = await fetch(`${API_BASE_URL}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activation_code: activationCode })
    });
    const data = await res.json();
    setMessage(data.message || data.detail);
    if (res.ok) setIsActivated(true);
  };

  const fetchSettings = async () => {
    const res = await fetch(`${API_BASE_URL}/get_settings`);
    const data = await res.json();
    setApiKey(data.api_key || '');
    setApiSecret(data.api_secret || '');
    setSettings(data.settings || { pairs: [], strategies: [] });
    setBotStatus(data.bot_status || 'stopped');
  };

  useEffect(() => {
    if (isActivated) {
      fetchSettings();
    }
  }, [isActivated]);

  const updateSettings = async () => {
    const res = await fetch(`${API_BASE_URL}/update_settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret, settings })
    });
    const data = await res.json();
    setMessage(data.message || data.detail);
  };

  const updateBotStatus = async (status) => {
    const res = await fetch(`${API_BASE_URL}/bot_status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    setMessage(data.message || data.detail);
    setBotStatus(status);
  };

  const fetchBalance = async () => {
    const res = await fetch(`${API_BASE_URL}/binance_balance`);
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.detail || 'Erreur lors de la récupération du solde');
      return;
    }
    const data = await res.json();
    setBalances(data);
    setMessage('');
  };

  return (
    <div style={{ backgroundColor: '#000', color: 'gold', padding: '20px', minHeight: '100vh', fontFamily: 'Arial' }}>
      <h1>Power MS Trading Pro</h1>
      {!isActivated ? (
        <div>
          <input
            type="text"
            placeholder="Code d'activation"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            style={{ padding: '10px', fontSize: '16px' }}
          />
          <button onClick={activate} style={{ marginLeft: '10px', padding: '10px' }}>Activer</button>
        </div>
      ) : (
        <div>
          <h3>Paramètres</h3>
          <input
            type="text"
            placeholder="API Key Binance"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', width: '300px' }}
          /><br/><br/>
          <input
            type="text"
            placeholder="API Secret Binance"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', width: '300px' }}
          /><br/><br/>
          <button onClick={updateSettings} style={{ padding: '10px' }}>Enregistrer</button>
          <br /><br />
          <h3>Status du Bot: {botStatus}</h3>
          <button onClick={() => updateBotStatus('running')} style={{ marginRight: '10px' }}>Démarrer</button>
          <button onClick={() => updateBotStatus('stopped')}>Arrêter</button>
          <br /><br />
          <button onClick={fetchBalance}>Afficher Solde Binance</button>
          <ul>
            {balances.map(b => (
              <li key={b.asset}>
                {b.asset}: Libre: {b.free} - Bloqué: {b.locked}
              </li>
            ))}
          </ul>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default App;
