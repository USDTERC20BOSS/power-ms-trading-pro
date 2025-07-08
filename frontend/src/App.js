import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaPlay, FaStop, FaSync, FaChartLine, FaExchangeAlt, FaCog, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Base URL للـ API
const API_BASE_URL = 'https://power-ms-trading-pro-1.onrender.com';

// نقاط النهاية
const ENDPOINTS = {
  ACTIVATE: `${API_BASE_URL}/activate`,
  UPDATE_SETTINGS: `${API_BASE_URL}/update_settings`,
  GET_SETTINGS: `${API_BASE_URL}/get_settings`,
  BOT_STATUS: `${API_BASE_URL}/bot_status`,
  BINANCE_BALANCE: `${API_BASE_URL}/binance_balance`,
  PREDICT_SIGNAL: `${API_BASE_URL}/predict_signal`
};

// أزواج التداول المتاحة
const tradingPairs = [
  { symbol: 'BTC/USDT', base: 'BTC', quote: 'USDT', status: 'active' },
  { symbol: 'ETH/USDT', base: 'ETH', quote: 'USDT', status: 'active' },
  { symbol: 'BNB/USDT', base: 'BNB', quote: 'USDT', status: 'active' },
  { symbol: 'SOL/USDT', base: 'SOL', quote: 'USDT', status: 'active' },
  { symbol: 'XRP/USDT', base: 'XRP', quote: 'USDT', status: 'active' },
  { symbol: 'ADA/USDT', base: 'ADA', quote: 'USDT', status: 'active' },
];

// الاستراتيجيات المتاحة
const strategies = [
  { id: 1, name: 'RSI + MACD', description: 'جمع بين مؤشر RSI و MACD' },
  { id: 2, name: 'Bollinger Bands', description: 'تداول عند اختراق النطاقات' },
  { id: 3, name: 'Moving Average Crossover', description: 'تقاطع المتوسطات المتحركة' },
];

// إشارات التداول الحية
const liveSignals = [
  { id: 1, pair: 'BTC/USDT', strategy: 'RSI + MACD', signal: 'BUY', price: '42,350.25', time: '10:30:45', strength: 'strong' },
  { id: 2, pair: 'ETH/USDT', strategy: 'Bollinger Bands', signal: 'SELL', price: '2,345.67', time: '11:15:22', strength: 'medium' },
];

// بيانات تجريبية للرسم البياني
const sampleData = [
  { name: 'Jan', profit: 400 },
  { name: 'Feb', profit: 300 },
  { name: 'Mar', profit: 600 },
  { name: 'Apr', profit: 800 },
  { name: 'May', profit: 500 },
  { name: 'Jun', profit: 900 },
];

function App() {
  const [activationCode, setActivationCode] = useState('');
  const [message, setMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [settings, setSettings] = useState({ pairs: [], strategies: [] });
  const [isActivated, setIsActivated] = useState(false);
  const [botStatus, setBotStatus] = useState('stopped');
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [selectedStrategy, setSelectedStrategy] = useState('RSI + MACD');

  const activate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.ACTIVATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activation_code: activationCode })
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsActivated(true);
        setMessage('Compte activé avec succès!');
        toast.success('Compte activé avec succès!');
      } else {
        throw new Error(data.detail || 'Erreur d\'activation');
      }
    } catch (error) {
      console.error('Erreur d\'activation:', error);
      setMessage(`Erreur: ${error.message}`);
      toast.error(`Erreur d'activation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApiKeys = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.UPDATE_SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: apiKey,
          api_secret: apiSecret,
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Paramètres mis à jour avec succès');
        toast.success('Paramètres mis à jour avec succès');
      } else {
        throw new Error(data.detail || 'Erreur de mise à jour des paramètres');
      }
    } catch (error) {
      console.error('Erreur de mise à jour des paramètres:', error);
      setMessage(`Erreur: ${error.message}`);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBotStatus = async (status) => {
    setIsLoading(true);
    setMessage(`Mise à jour du statut en cours...`);
    try {
      const res = await fetch(ENDPOINTS.BOT_STATUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      if (res.ok) {
        setBotStatus(status);
        setMessage(`Bot ${status === 'running' ? 'démarré' : 'arrêté'} avec succès`);
        toast.success(`Bot ${status === 'running' ? 'démarré' : 'arrêté'} avec succès`);
      } else {
        throw new Error(data.detail || 'Erreur de mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur de mise à jour du statut:', error);
      setMessage(`Erreur: ${error.message}`);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.BINANCE_BALANCE);
      const data = await res.json();
      
      if (res.ok) {
        setBalances(data.balances || []);
        toast.success('Solde mis à jour avec succès');
      } else {
        throw new Error(data.detail || 'Erreur de récupération du solde');
      }
    } catch (error) {
      console.error('Erreur de récupération du solde:', error);
      setMessage(`Erreur: ${error.message}`);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier l'état d'activation au chargement
    const fetchBalances = async () => {
      try {
        const res = await fetch(ENDPOINTS.BINANCE_BALANCE);
        const data = await res.json();
        if (res.ok) {
          setBalances(data.balances || []);
        }
      } catch (error) {
        console.error('Erreur de récupération du solde:', error);
      }
    };
    
    const checkActivation = async () => {
      try {
        const res = await fetch(ENDPOINTS.GET_SETTINGS);
        const data = await res.json();
        if (res.ok && data.activated) {
          setIsActivated(true);
          if (data.api_key) setApiKey(data.api_key);
          if (data.api_secret) setApiSecret(data.api_secret);
        }
      } catch (error) {
        console.error('Erreur de vérification d\'activation:', error);
      }
    };
    
    checkActivation();
  }, []);

  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <header className="app-header">
        <div className="header-content">
          <h1><FaChartLine className="header-icon" /> Power MS Trading Pro</h1>
          <div className="bot-status">
            <span className={`status-indicator ${botStatus === 'running' ? 'running' : 'stopped'}`}></span>
            <span>Bot: {botStatus === 'running' ? 'En cours' : 'Arrêté'}</span>
          </div>
        </div>
      </header>

      <div className="app-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            لوحة التحكم
          </button>
          <button 
            className={`tab ${activeTab === 'pairs' ? 'active' : ''}`}
            onClick={() => setActiveTab('pairs')}
          >
            أزواج التداول
          </button>
          <button 
            className={`tab ${activeTab === 'strategies' ? 'active' : ''}`}
            onClick={() => setActiveTab('strategies')}
          >
            الاستراتيجيات
          </button>
          <button 
            className={`tab ${activeTab === 'signals' ? 'active' : ''}`}
            onClick={() => setActiveTab('signals')}
          >
            إشارات التداول
          </button>
        </div>

        {activeTab === 'dashboard' && (
        {!isActivated ? (
          <div className="activation-container">
            <h2><FaInfoCircle /> Activation Requise</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Entrez le code d'activation"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                className="form-input"
              />
              <button 
                onClick={activate} 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Traitement...' : 'Activer'}
              </button>
            </div>
            {message && <p className={`message ${message.includes('Erreur') ? 'error' : 'success'}`}>{message}</p>}
          </div>
        ) : (
          <div className="dashboard">
            {/* Section Statut et Contrôles */}
            <div className="dashboard-row">
              <div className="status-card">
                <h3><FaInfoCircle /> Statut du Compte</h3>
                <div className="status-grid">
                  <div className="status-item">
                    <span className="label">Solde Total (USDT)</span>
                    <span className="value">5,423.76</span>
                  </div>
                  <div className="status-item">
                    <span className="label">Profit du Jour</span>
                    <span className="value profit">+$124.50 (2.35%)</span>
                  </div>
                  <div className="status-item">
                    <span className="label">Nombre de Paires</span>
                    <span className="value">8</span>
                  </div>
                </div>
              </div>

              <div className="controls-card">
                <h3><FaCog /> Contrôles</h3>
                <div className="controls-grid">
                  <button 
                    onClick={() => updateBotStatus('running')} 
                    className={`control-btn ${botStatus === 'running' ? 'active' : ''}`}
                    disabled={botStatus === 'running' || isLoading}
                  >
                    <FaPlay /> Démarrer
                  </button>
                  <button 
                    onClick={() => updateBotStatus('stopped')}
                    className={`control-btn stop ${botStatus === 'stopped' ? 'active' : ''}`}
                    disabled={botStatus === 'stopped' || isLoading}
                  >
                    <FaStop /> Arrêter
                  </button>
                  <button 
                    onClick={fetchBalance}
                    className="control-btn refresh"
                    disabled={isLoading}
                  >
                    <FaSync /> Actualiser
                  </button>
                </div>
              </div>
            </div>

            {/* Section Graphique de Performance */}
            <div className="chart-card">
              <h3><FaChartLine /> Performance du Portefeuille</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="profit" stroke="#4CAF50" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Section Paires et Transactions */}
            <div className="dashboard-row">
              {/* Paires Actives */}
              <div className="pairs-card">
                <h3><FaExchangeAlt /> Paires Actives</h3>
                <div className="pairs-grid">
                  {['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'].map((pair) => (
                    <div key={pair} className="pair-item">
                      <span className="pair-name">{pair}</span>
                      <span className="pair-status active">Actif</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dernières Transactions */}
              <div className="transactions-card">
                <h3>Dernières Transactions</h3>
                <div className="transactions-list">
                  {sampleTrades.map((trade) => (
                    <div key={trade.id} className={`trade-item ${trade.type.toLowerCase()}`}>
                      <div className="trade-header">
                        <span className="trade-pair">{trade.pair}</span>
                        <span className={`trade-type ${trade.type.toLowerCase()}`}>
                          {trade.type}
                        </span>
                      </div>
                      <div className="trade-details">
                        <span>Prix: {trade.price}</span>
                        <span>Montant: {trade.amount}</span>
                        <span>Total: {trade.total}</span>
                      </div>
                      <div className="trade-time">{trade.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Configuration API */}
            <div className="api-config-card">
              <h3><FaCog /> Configuration API</h3>
              <div className="input-group">
                <label>Clé API Binance</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Entrez votre clé API Binance"
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>Secret API Binance</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="Entrez votre secret API Binance"
                  className="form-input"
                />
              </div>
              <button 
                onClick={updateSettings} 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
              </button>
            </div>

            {/* Section Solde */}
            <div className="balance-card">
              <h3>Solde du Portefeuille</h3>
              <div className="balance-grid">
                {balances.length > 0 ? (
                  balances.map((balance) => (
                    <div key={balance.asset} className="balance-item">
                      <span className="asset">{balance.asset}</span>
                      <div className="amounts">
                        <span className="free">Libre: {parseFloat(balance.free).toFixed(8)}</span>
                        {balance.locked > 0 && (
                          <span className="locked">Verrouillé: {parseFloat(balance.locked).toFixed(8)}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-balance">Aucun solde disponible</p>
                )}
              </div>
            </div>
          </div>
        )}
        )}

        {activeTab === 'pairs' && (
          <div className="pairs-container">
            <h2>أزواج التداول المتاحة</h2>
            <div className="pairs-grid">
              {tradingPairs.map((pair) => (
                <div key={pair.symbol} className="pair-card">
                  <h3>{pair.symbol}</h3>
                  <p>العملة الأساسية: {pair.base}</p>
                  <p>عملة التسعير: {pair.quote}</p>
                  <span className={`status ${pair.status}`}>{pair.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="strategies-container">
            <h2>الاستراتيجيات المتاحة</h2>
            <div className="strategies-grid">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="strategy-card">
                  <h3>{strategy.name}</h3>
                  <p>{strategy.description}</p>
                  <button 
                    className={`btn ${selectedStrategy === strategy.name ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedStrategy(strategy.name)}
                  >
                    {selectedStrategy === strategy.name ? 'محدد' : 'تحديد'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="signals-container">
            <h2>إشارات التداول الحية</h2>
            <div className="signals-list">
              {liveSignals.map((signal) => (
                <div key={signal.id} className={`signal-card ${signal.signal.toLowerCase()}`}>
                  <div className="signal-header">
                    <span className="pair">{signal.pair}</span>
                    <span className={`signal ${signal.signal.toLowerCase()}`}>
                      {signal.signal === 'BUY' ? 'شراء' : 'بيع'}
                    </span>
                  </div>
                  <div className="signal-details">
                    <p>الاستراتيجية: {signal.strategy}</p>
                    <p>السعر: {signal.price} USDT</p>
                    <p>القوة: {signal.strength === 'strong' ? 'قوية' : 'متوسطة'}</p>
                  </div>
                  <div className="signal-time">{signal.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
