import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaPlay, FaStop, FaSync, FaChartLine, FaExchangeAlt, FaCog, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import RiskManagementPanel from './components/RiskManagementPanel';

// استيراد خط Tajawal للغة العربية
import './fonts/Tajawal.css';

// Base URL للـ API - سيتم تعيينه من متغير البيئة أو استخدام الرابط الافتراضي
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://power-ms-trading-pro-backend.onrender.com';

// نقاط النهاية
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

// تكوين Toastify للغة العربية
const toastSettings = {
  position: "top-left",
  rtl: true,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
  className: 'font-tajawal'
};

function App() {
  // حالة التفعيل والمصادقة
  const [activationCode, setActivationCode] = useState('');
  const [message, setMessage] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  
  // حالة التحميل والواجهة
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // حالة التداول
  const [tradingPairs, setTradingPairs] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [botStatus, setBotStatus] = useState('stopped');
  
  // التنبيهات والإشعارات
  const [alerts, setAlerts] = useState([]);
  const [alertSound] = useState(new Audio('https://www.soundjay.com/buttons/button-09a.mp3'));
  
  // مفاتيح API
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  
  // أرصدة المحفظة
  const [balances, setBalances] = useState([]);

  // تأثير لجلب البيانات الأولية
  useEffect(() => {
    fetchInitialData();
  }, []);

  // دالة لجلب البيانات الأولية
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // جلب قائمة الاستراتيجيات المتاحة
      const strategiesRes = await fetch(ENDPOINTS.GET_STRATEGIES);
      const strategiesData = await strategiesRes.json();
      if (strategiesRes.ok) {
        setStrategies(strategiesData.strategies || []);
      }
      
      // جلب قائمة الأزواج المتاحة
      const pairsRes = await fetch(ENDPOINTS.GET_PAIRS);
      const pairsData = await pairsRes.json();
      if (pairsRes.ok) {
        setTradingPairs(pairsData.pairs || []);
      }
      
      // جلب حالة البوت الحالية
      const statusRes = await fetch(ENDPOINTS.BOT_STATUS);
      const statusData = await statusRes.json();
      if (statusRes.ok) {
        setBotStatus(statusData.status || 'stopped');
        setSelectedStrategy(statusData.strategy || '');
        setSelectedPairs(statusData.pairs || []);
      }
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('حدث خطأ أثناء جلب البيانات الأولية');
    } finally {
      setIsLoading(false);
    }
  };

  // دالة تفعيل البوت
  const activateBot = async () => {
    try {
      setIsLoading(true);
      
      // طلب رمز التفعيل من المستخدم
      const activationCode = prompt('الرجاء إدخال رمز التفعيل:');
      
      if (!activationCode) {
        throw new Error('يجب إدخال رمز التفعيل');
      }
      
      const response = await fetch(ENDPOINTS.ACTIVATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activation_code: activationCode,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsActivated(true);
        setBotStatus('running');
        toast.success('تم تفعيل البوت بنجاح');
      } else {
        throw new Error(data.detail || 'فشل في تفعيل البوت');
      }
      
    } catch (error) {
      console.error('Error activating bot:', error);
      toast.error(error.message || 'حدث خطأ أثناء تفعيل البوت');
    } finally {
      setIsLoading(false);
    }
  };

  // دالة إيقاف البوت
  const stopBot = async () => {
    try {
      setIsLoading(true);
      
      // استخدام نفس نقطة نهاية التفعيل مع معلمة deactivate
      const response = await fetch(ENDPOINTS.ACTIVATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deactivate'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsActivated(false);
        setBotStatus('stopped');
        toast.success('تم إيقاف البوت بنجاح');
      } else {
        throw new Error(data.detail || 'فشل في إيقاف البوت');
      }
      
    } catch (error) {
      console.error('Error stopping bot:', error);
      toast.error(error.message || 'حدث خطأ أثناء إيقاف البوت');
    } finally {
      setIsLoading(false);
    }
  };

  // مكون واجهة المستخدم لإدارة المخاطر
  const RiskManagementPanelComponent = () => (
    <RiskManagementPanel apiBaseUrl={API_BASE_URL} />
  );

  // مكون لوحة التحكم الرئيسية
  const DashboardPanel = () => (
    <div className="dashboard-panel">
      <div className="status-card">
        <h3>حالة البوت: <span className={botStatus === 'running' ? 'status-active' : 'status-inactive'}>
          {botStatus === 'running' ? 'نشط' : 'متوقف'}
        </span></h3>
        
        <div className="action-buttons">
          <button 
            className={`btn btn-start ${botStatus === 'running' ? 'active' : ''}`}
            onClick={activateBot}
            disabled={isLoading || botStatus === 'running'}
          >
            <FaPlay /> تشغيل
          </button>
          
          <button 
            className={`btn btn-stop ${botStatus === 'stopped' ? 'active' : ''}`}
            onClick={stopBot}
            disabled={isLoading || botStatus === 'stopped'}
          >
            <FaStop /> إيقاف
          </button>
          
          <button 
            className="btn btn-refresh"
            onClick={fetchInitialData}
            disabled={isLoading}
          >
            <FaSync /> تحديث
          </button>
        </div>
        
        <div className="bot-info">
          <div className="info-item">
            <span className="info-label">الاستراتيجية المختارة:</span>
            <span className="info-value">
              {selectedStrategy || 'لم يتم اختيار استراتيجية'}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">عدد الأزواج المختارة:</span>
            <span className="info-value">
              {selectedPairs.length} زوج
            </span>
          </div>
        </div>
      </div>
      
      <div className="trading-pairs">
        <h3>الأزواج المختارة</h3>
        {selectedPairs.length > 0 ? (
          <div className="pairs-list">
            {selectedPairs.map((pair, index) => (
              <span key={index} className="pair-tag">
                {pair}
              </span>
            ))}
          </div>
        ) : (
          <p className="no-pairs">لم يتم اختيار أي أزواج بعد</p>
        )}
      </div>
    </div>
  );

  // مكون لوحة الإعدادات
  const SettingsPanel = () => (
    <div className="settings-panel">
      <div className="api-settings">
        <h3>إعدادات API</h3>
        <div className="form-group">
          <label>Binance API Key:</label>
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="أدخل مفتاح API الخاص بك"
          />
        </div>
        
        <div className="form-group">
          <label>Binance API Secret:</label>
          <input 
            type="password" 
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="أدخل السر السري لـ API"
          />
        </div>
        
        <div className="form-group">
          <label>اختر الاستراتيجية:</label>
          <select 
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            disabled={botStatus === 'running'}
          >
            <option value="">-- اختر استراتيجية --</option>
            {strategies.map((strategy, index) => (
              <option key={index} value={strategy.id}>
                {strategy.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>اختر أزواج التداول:</label>
          <div className="pairs-selector">
            {tradingPairs.map((pair, index) => (
              <label key={index} className="pair-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPairs.includes(pair)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPairs([...selectedPairs, pair]);
                    } else {
                      setSelectedPairs(selectedPairs.filter(p => p !== pair));
                    }
                  }}
                  disabled={botStatus === 'running'}
                />
                {pair}
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="risk-settings">
        <RiskManagementPanelComponent />
      </div>
    </div>
  );

  // مكون لوحة التنبيهات
  const AlertsPanel = () => (
    <div className="alerts-panel">
      <h3>سجل التنبيهات</h3>
      
      {alerts.length > 0 ? (
        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <div key={index} className={`alert-item ${alert.type}`}>
              <div className="alert-header">
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
                <span className={`alert-type ${alert.type}`}>
                  {alert.type === 'buy' ? 'شراء' : 'بيع'}
                </span>
              </div>
              <div className="alert-message">{alert.message}</div>
              {alert.pair && (
                <div className="alert-pair">
                  الزوج: <strong>{alert.pair}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-alerts">
          لا توجد تنبيهات حتى الآن
        </div>
      )}
    </div>
  );

  return (
    <div className="app" dir="rtl">
      <ToastContainer 
        position="top-left"
        rtl={true}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="font-tajawal"
      />
      <header className="app-header">
        <h1>
          <FaChartLine className="logo-icon" />
          Power MS Trading Pro
        </h1>
        
        <nav className="main-nav">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartLine /> لوحة التحكم
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> الإعدادات
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <FaExchangeAlt /> التنبيهات
          </button>
        </nav>
      </header>
      
      <main className="app-content">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>جاري التحميل...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardPanel />}
            {activeTab === 'settings' && <SettingsPanel />}
            {activeTab === 'alerts' && <AlertsPanel />}
          </>
        )}
      </main>
      
      <ToastContainer 
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
