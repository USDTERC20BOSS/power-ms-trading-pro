import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaPlay, FaStop, FaSync, FaChartLine, FaExchangeAlt, FaCog, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import RiskManagementPanel from './components/RiskManagementPanel';

// URL de base de l'API - peut être défini par une variable d'environnement ou utiliser l'URL par défaut
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://power-ms-trading-pro.onrender.com';

// Points de terminaison de l'API
const ENDPOINTS = {
  ACTIVATE: `${API_BASE_URL}/activate`,
  UPDATE_SETTINGS: `${API_BASE_URL}/update_settings`,
  GET_SETTINGS: `${API_BASE_URL}/get_settings`,
  BOT_STATUS: `${API_BASE_URL}/bot_status`,
  BALANCE: `${API_BASE_URL}/binance_balance`,
  GET_STRATEGIES: `${API_BASE_URL}/get_strategies`,
  GET_PAIRS: `${API_BASE_URL}/get_pairs`,
  PREDICT_SIGNAL: `${API_BASE_URL}/predict_signal`,
  UPDATE_RISK_SETTINGS: `${API_BASE_URL}/update_risk_settings`
};

// Configuration de Toastify pour les notifications
const toastSettings = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark"
};

function App() {
  // État d'activation et d'authentification
  const [activationCode, setActivationCode] = useState('');
  const [message, setMessage] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  
  // État de chargement et interface utilisateur
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [botStatus, setBotStatus] = useState('stopped');
  
  // Paramètres de trading
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [tradingPairs, setTradingPairs] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [strategies, setStrategies] = useState([]);
  
  // Gestion des risques
  const [takeProfit, setTakeProfit] = useState(2);
  const [stopLoss, setStopLoss] = useState(1);
  const [maxRisk, setMaxRisk] = useState(1);
  const [trailingStop, setTrailingStop] = useState(false);
  
  // Alertes
  const [alerts, setAlerts] = useState([]);
  
  // Solde et bénéfices
  const [balance, setBalance] = useState(0);
  const [profit, setProfit] = useState(0);
  const [trades, setTrades] = useState([]);

  // Effet pour charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les stratégies disponibles
        const strategiesRes = await fetch(ENDPOINTS.GET_STRATEGIES);
        if (!strategiesRes.ok) throw new Error('Échec du chargement des stratégies');
        const strategiesData = await strategiesRes.json();
        setStrategies(strategiesData.strategies || []);
        
        // Récupérer les paires de trading disponibles
        const pairsRes = await fetch(ENDPOINTS.GET_PAIRS);
        if (!pairsRes.ok) throw new Error('Échec du chargement des paires de trading');
        const pairsData = await pairsRes.json();
        setTradingPairs(pairsData.pairs || []);
        
        // Récupérer l'état actuel du bot
        const statusRes = await fetch(ENDPOINTS.BOT_STATUS);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setBotStatus(statusData.status || 'stopped');
          setIsActivated(statusData.activated || false);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données initiales:', error);
        toast.error(error.message || 'Une erreur est survenue lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Fonction pour activer le bot
  const activateBot = async () => {
    try {
      setIsLoading(true);
      
      // Demander le code d'activation à l'utilisateur
      const activationCode = prompt('Veuillez entrer le code d\'activation:');
      
      if (!activationCode) {
        throw new Error('Le code d\'activation est requis');
      }
      
      const response = await fetch(ENDPOINTS.ACTIVATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'fr'
        },
        body: JSON.stringify({
          activation_code: activationCode,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsActivated(true);
        setBotStatus('running');
        toast.success('Bot activé avec succès');
      } else {
        throw new Error(data.detail || 'Échec de l\'activation du bot');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'activation du bot:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'activation du bot');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour arrêter le bot
  const stopBot = async () => {
    try {
      setIsLoading(true);
      
      // Utiliser le même point de terminaison avec l'action de désactivation
      const response = await fetch(ENDPOINTS.ACTIVATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'fr'
        },
        body: JSON.stringify({
          action: 'deactivate'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsActivated(false);
        setBotStatus('stopped');
        toast.success('Bot arrêté avec succès');
      } else {
        throw new Error(data.detail || 'Échec de l\'arrêt du bot');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du bot:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'arrêt du bot');
    } finally {
      setIsLoading(false);
    }
  };

  // Composant de gestion des risques
  const RiskManagementPanel = () => (
    <div className="risk-management">
      <h2>Gestion des risques</h2>
      <div className="risk-settings">
        <div className="form-group">
          <label>Objectif de profit (%)</label>
          <input 
            type="number" 
            value={takeProfit} 
            onChange={(e) => setTakeProfit(e.target.value)} 
            min="0" 
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label>Stop-loss (%)</label>
          <input 
            type="number" 
            value={stopLoss} 
            onChange={(e) => setStopLoss(e.target.value)} 
            min="0" 
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label>Risque maximum (%)</label>
          <input 
            type="number" 
            value={maxRisk} 
            onChange={(e) => setMaxRisk(e.target.value)} 
            min="0" 
            max="100" 
            step="1"
          />
        </div>
        <div className="form-group checkbox-group">
          <input 
            type="checkbox" 
            id="trailingStop" 
            checked={trailingStop} 
            onChange={(e) => setTrailingStop(e.target.checked)} 
          />
          <label htmlFor="trailingStop">Stop-loss suiveur</label>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </div>
  );

  // Tableau de bord principal
  const DashboardPanel = () => (
    <div className="dashboard-panel">
      <div className="status-card">
        <h3>État du bot: <span className={botStatus === 'running' ? 'status-active' : 'status-inactive'}>
          {botStatus === 'running' ? 'Actif' : 'Arrêté'}
        </span></h3>
        
        <div className="action-buttons">
          <button 
            className={`btn btn-start ${botStatus === 'running' ? 'active' : ''}`}
            onClick={activateBot}
            disabled={isLoading || botStatus === 'running'}
          >
            <FaPlay /> Démarrer
          </button>
          <button 
            className={`btn btn-stop ${botStatus === 'stopped' ? 'active' : ''}`}
            onClick={stopBot}
            disabled={isLoading || botStatus === 'stopped'}
          >
            <FaStop /> Arrêter
          </button>
          <button 
            className="btn btn-refresh"
            onClick={fetchInitialData}
            disabled={isLoading}
          >
            <FaSync /> Actualiser
          </button>
        </div>
        
        <div className="trading-pairs">
          <h3>Paires sélectionnées</h3>
          {selectedPairs.length > 0 ? (
            <div className="pairs-list">
              {selectedPairs.map((pair, index) => (
                <span key={index} className="pair-tag">{pair}</span>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucune paire sélectionnée</p>
          )}
        </div>
        
        <div className="strategy-info">
          <h3>Stratégie sélectionnée</h3>
          {selectedStrategy ? (
            <p>{selectedStrategy}</p>
          ) : (
            <p className="no-data">Aucune stratégie sélectionnée</p>
          )}
        </div>
      </div>
    </div>
  );

  // Paramètres de trading
  const SettingsPanel = () => (
    <div className="settings-panel">
      <h2>Paramètres</h2>
      
      <div className="api-settings">
        <h3>Paramètres API</h3>
        <div className="form-group">
          <label>Clé API :</label>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            placeholder="Entrez votre clé API"
          />
        </div>
        <div className="form-group">
          <label>Clé secrète :</label>
          <input 
            type="password" 
            value={apiSecret} 
            onChange={(e) => setApiSecret(e.target.value)} 
            placeholder="Entrez votre clé secrète"
          />
        </div>
        <button 
          className="btn btn-primary"
          onClick={saveApiKeys}
          disabled={isLoading || !apiKey || !apiSecret}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les clés'}
        </button>
      </div>
      
      <div className="trading-settings">
        <h3>Paramètres de trading</h3>
        <div className="form-group">
          <label>Stratégie :</label>
          <select 
            value={selectedStrategy} 
            onChange={(e) => setSelectedStrategy(e.target.value)}
            disabled={isLoading}
          >
            <option value="">-- Sélectionnez une stratégie --</option>
            {strategies.map((strategy, index) => (
              <option key={index} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Paires de trading :</label>
          <div className="pairs-selector">
            {tradingPairs.map((pair, index) => (
              <div key={index} className="pair-option">
                <input 
                  type="checkbox" 
                  id={`pair-${index}`} 
                  checked={selectedPairs.includes(pair)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPairs([...selectedPairs, pair]);
                    } else {
                      setSelectedPairs(selectedPairs.filter(p => p !== pair));
                    }
                  }}
                  disabled={isLoading}
                />
                <label htmlFor={`pair-${index}`}>{pair}</label>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={saveTradingSettings}
          disabled={isLoading || !selectedStrategy || selectedPairs.length === 0}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </div>
  );

  // Panneau d'alerte
  const AlertsPanel = () => (
    <div className="alerts-panel">
      <h3>Historique des transactions</h3>
      {alerts.length > 0 ? (
        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <div key={index} className={`alert-item ${alert.type}`}>
              <div className="alert-header">
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleString('fr-FR')}
                </span>
                <span className={`alert-type ${alert.type}`}>
                  {alert.type === 'buy' ? 'Achat' : 'Vente'}
                </span>
              </div>
              <div className="alert-message">{alert.message}</div>
              {alert.pair && (
                <div className="alert-pair">
                  Paire: <strong>{alert.pair}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-alerts">Aucune transaction pour le moment</div>
      )}
    </div>
  );

  return (
    <div className="app">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <header className="app-header">
        <h1>Power MS Trading Pro</h1>
        <div className="header-actions">
          <button 
            className={`btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartLine /> Tableau de bord
          </button>
          <button 
            className={`btn ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            <FaExchangeAlt /> Transactions
          </button>
          <button 
            className={`btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Paramètres
          </button>
          <button 
            className={`btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FaInfoCircle /> À propos
          </button>
        </div>
      </header>
      
      <main className="app-main">
        {isLoading ? (
          <div className="loading">Chargement en cours...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardPanel />}
            {activeTab === 'trades' && <AlertsPanel />}
            {activeTab === 'settings' && <SettingsPanel />}
            {activeTab === 'info' && <InfoPanel />}
          </>
        )}
      </main>
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Power MS Trading Pro. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default App;
