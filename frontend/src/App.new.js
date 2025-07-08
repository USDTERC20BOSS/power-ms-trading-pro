import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaPlay, FaStop, FaSync, FaChartLine, FaExchangeAlt, FaCog, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Base URL للـ API
const API_BASE_URL = 'https://power-ms-trading-pro-1.onrender.com';

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
  const [isActivated, setIsActivated] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showApiForm, setShowApiForm] = useState(false);
  const [botStatus, setBotStatus] = useState('stopped');
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [selectedStrategy, setSelectedStrategy] = useState('RSI + MACD');

  const activate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activation_code: activationCode })
      });
      const data = await res.json();
      if (res.ok) {
        setIsActivated(true);
        setMessage('تم التفعيل بنجاح!');
        toast.success('تم تفعيل البوت بنجاح');
      } else {
        throw new Error(data.detail || 'فشل في التفعيل');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`خطأ: ${error.message}`);
      toast.error(`خطأ: ${error.message}`);
    }
    setIsLoading(false);
  };

  const updateApiKeys = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/update_api_keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('تم تحديث مفاتيح API بنجاح');
        toast.success('تم حفظ مفاتيح API بنجاح');
        setShowApiForm(false);
      } else {
        throw new Error(data.detail || 'فشل في تحديث المفاتيح');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`خطأ: ${error.message}`);
      toast.error(`خطأ: ${error.message}`);
    }
    setIsLoading(false);
  };

  const updateBotStatus = async (status) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bot_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setBotStatus(status);
        setMessage(`تم تحديث حالة البوت إلى: ${status}`);
        toast.success(`حالة البوت: ${status === 'running' ? 'قيد التشغيل' : 'متوقف'}`);
      } else {
        throw new Error(data.detail || 'فشل في تحديث حالة البوت');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`خطأ: ${error.message}`);
      toast.error(`خطأ: ${error.message}`);
    }
    setIsLoading(false);
  };

  const fetchBalances = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_balances`);
      const data = await res.json();
      if (res.ok) {
        setBalances(data.balances || []);
      } else {
        throw new Error(data.detail || 'فشل في جلب الأرصدة');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`خطأ: ${error.message}`);
      toast.error(`خطأ: ${error.message}`);
    }
  };

  // Fetch initial data
  useEffect(() => {
    // Simulate checking activation status
    const checkActivation = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/check_activation`);
        const data = await res.json();
        if (res.ok && data.activated) {
          setIsActivated(true);
          setBotStatus(data.status || 'stopped');
        }
      } catch (error) {
        console.error('Error checking activation:', error);
      }
    };
    
    checkActivation();
    fetchBalances();
  }, []);

  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={5000} rtl={true} />
      <header className="app-header">
        <h1>Power MS Trading Pro</h1>
        <div className="bot-status">
          <span className={`status-dot ${botStatus}`}></span>
          {botStatus === 'running' ? 'قيد التشغيل' : 'متوقف'}
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
          <div className="dashboard">
            {!isActivated ? (
              <div className="activation-container">
                <h2><FaInfoCircle /> تفعيل البوت</h2>
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="أدخل كود التفعيل"
                  className="input-field"
                />
                <button 
                  onClick={activate} 
                  disabled={isLoading || !activationCode}
                  className="btn btn-primary"
                >
                  {isLoading ? 'جاري التفعيل...' : 'تفعيل'}
                </button>
                {message && <p className="message">{message}</p>}
              </div>
            ) : (
              <div className="dashboard-content">
                <div className="dashboard-header">
                  <h2>لوحة التحكم</h2>
                  <div className="bot-controls">
                    <button 
                      onClick={() => updateBotStatus('running')} 
                      disabled={isLoading || botStatus === 'running'}
                      className={`btn ${botStatus === 'running' ? 'btn-success' : 'btn-primary'}`}
                    >
                      <FaPlay /> تشغيل البوت
                    </button>
                    <button 
                      onClick={() => updateBotStatus('stopped')} 
                      disabled={isLoading || botStatus === 'stopped'}
                      className="btn btn-danger"
                    >
                      <FaStop /> إيقاف البوت
                    </button>
                    <button 
                      onClick={fetchBalances} 
                      disabled={isLoading}
                      className="btn btn-secondary"
                    >
                      <FaSync /> تحديث
                    </button>
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="card">
                    <h3>حالة الحساب</h3>
                    <div className="account-status">
                      <div className="status-item">
                        <span className="label">إجمالي الرصيد:</span>
                        <span className="value">$12,345.67</span>
                      </div>
                      <div className="status-item">
                        <span className="label">الربح اليومي:</span>
                        <span className="value profit">+$245.30 (2.1%)</span>
                      </div>
                      <div className="status-item">
                        <span className="label">عدد الأزواج النشطة:</span>
                        <span className="value">5/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="card chart-container">
                    <h3>أداء المحفظة</h3>
                    <div className="chart-wrapper">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={sampleData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="profit" stroke="#8884d8" name="الربح ($)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card">
                    <h3>الأزواج النشطة</h3>
                    <ul className="active-pairs">
                      <li>BTC/USDT <span className="price up">$42,350.25</span></li>
                      <li>ETH/USDT <span className="price down">$2,345.67</span></li>
                      <li>BNB/USDT <span className="price up">$305.12</span></li>
                    </ul>
                  </div>

                  <div className="card">
                    <h3>آخر الصفقات</h3>
                    <div className="recent-trades">
                      <div className="trade buy">
                        <span className="pair">BTC/USDT</span>
                        <span className="price">$42,350.25</span>
                        <span className="amount">0.05</span>
                        <span className="time">منذ 5 دقائق</span>
                      </div>
                      <div className="trade sell">
                        <span className="pair">ETH/USDT</span>
                        <span className="price">$2,345.67</span>
                        <span className="amount">0.5</span>
                        <span className="time">منذ 15 دقيقة</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="api-section">
                  <div className="api-header">
                    <h3>إعدادات API</h3>
                    <button 
                      onClick={() => setShowApiForm(!showApiForm)}
                      className="btn btn-secondary"
                    >
                      {showApiForm ? 'إخفاء' : 'تعديل مفاتيح API'}
                    </button>
                  </div>
                  
                  {showApiForm && (
                    <form onSubmit={updateApiKeys} className="api-form">
                      <div className="form-group">
                        <label>Binance API Key:</label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="أدخل API Key"
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Binance API Secret:</label>
                        <input
                          type="password"
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder="أدخل API Secret"
                          className="input-field"
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? 'جاري الحفظ...' : 'حفظ المفاتيح'}
                      </button>
                    </form>
                  )}
                </div>

                <div className="balance-section">
                  <h3>أرصدة المحفظة</h3>
                  <div className="balance-header">
                    <span>العملة</span>
                    <span>الرصيد المتاح</span>
                    <span>القيمة (USDT)</span>
                  </div>
                  <div className="balance-list">
                    <div className="balance-item">
                      <span className="asset">BTC</span>
                      <span className="free">0.05</span>
                      <span className="value">$2,117.50</span>
                    </div>
                    <div className="balance-item">
                      <span className="asset">ETH</span>
                      <span className="free">1.2</span>
                      <span className="value">$2,814.80</span>
                    </div>
                    <div className="balance-item">
                      <span className="asset">USDT</span>
                      <span className="free">5,000.00</span>
                      <span className="value">$5,000.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
