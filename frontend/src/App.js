import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaPlay, FaStop, FaSync, FaChartLine, FaExchangeAlt, FaCog, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

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

  // إعدادات إدارة المخاطر
  const [riskSettings, setRiskSettings] = useState({
    takeProfit: 5,        // القيمة الافتراضية 5%
    stopLoss: 1,          // القيمة الافتراضية 1%
    maxRiskPerTrade: 2,   // نسبة المخاطرة القصوى لكل صفقة
    trailingStop: false,   // تريلينج ستوب (إيقاف الخسارة المتابع)
    trailingStopDistance: 0.5 // مسافة التريلينج ستوب
  });



  // تحديث إعدادات المخاطرة
  const updateRiskSettings = (newSettings) => {
    setRiskSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // حفظ إعدادات المخاطرة في الخادم
  const saveRiskSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(ENDPOINTS.UPDATE_RISK_SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskSettings)
      });
      
      if (response.ok) {
        toast.success('تم حفظ إعدادات المخاطرة بنجاح');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'فشل في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving risk settings:', error);
      toast.error(`خطأ: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // مكون واجهة المستخدم لإدارة المخاطر
  const RiskManagementPanel = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">إدارة المخاطر</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Take Profit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Take Profit: {riskSettings.takeProfit}%
          </label>
          <input
            type="range"
            min="0.1"
            max="50"
            step="0.1"
            value={riskSettings.takeProfit}
            onChange={(e) => updateRiskSettings({ takeProfit: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.1%</span>
            <span>5%</span>
            <span>10%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Stop Loss */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stop Loss: {riskSettings.stopLoss}%
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={riskSettings.stopLoss}
            onChange={(e) => updateRiskSettings({ stopLoss: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.1%</span>
            <span>1%</span>
            <span>2%</span>
            <span>3%</span>
            <span>5%</span>
          </div>
        </div>

        {/* Max Risk Per Trade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المخاطرة القصوى لكل صفقة: {riskSettings.maxRiskPerTrade}%
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={riskSettings.maxRiskPerTrade}
            onChange={(e) => updateRiskSettings({ maxRiskPerTrade: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Trailing Stop */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="trailingStop"
              checked={riskSettings.trailingStop}
              onChange={(e) => updateRiskSettings({ trailingStop: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="trailingStop" className="mr-2 block text-sm text-gray-700">
              تفعيل التريلينج ستوب
            </label>
          </div>

          {riskSettings.trailingStop && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مسافة التريلينج: {riskSettings.trailingStopDistance}%
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={riskSettings.trailingStopDistance}
                onChange={(e) => updateRiskSettings({ trailingStopDistance: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={saveRiskSettings}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isLoading ? 'جاري الحفظ...' : 'حفظ إعدادات المخاطرة'}
        </button>
      </div>

      {/* شرح كيفية عمل الإعدادات */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">كيف تعمل إعدادات المخاطرة:</h4>
        <ul className="list-disc pr-5 space-y-1 text-sm text-gray-600">
          <li>
            <span className="font-medium">Take Profit ({riskSettings.takeProfit}%):</span> 
            سيتم إغلاق الصفقة تلقائياً عند تحقيق ربح بنسبة {riskSettings.takeProfit}% من سعر الدخول.
          </li>
          <li>
            <span className="font-medium">Stop Loss ({riskSettings.stopLoss}%):</span> 
            سيتم إغلاق الصفقة تلقائياً عند خسارة {riskSettings.stopLoss}% من رأس المال المستثمر.
          </li>
          <li>
            <span className="font-medium">نسبة المخاطرة ({riskSettings.maxRiskPerTrade}%):</span> 
            أقصى مبلغ يمكن خسارته في كل صفقة كنسبة من رأس المال.
          </li>
          {riskSettings.trailingStop && (
            <li>
              <span className="font-medium">تريلينج ستوب ({riskSettings.trailingStopDistance}%):</span> 
              يتحرك Stop Loss للأعلى مع تحرك السعر لصالحك، مما يحقق مكاسب مؤمنة.
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  // دالة لحفظ الإعدادات
  const saveSettings = async () => {
    if (!selectedStrategy) {
      toast.error('الرجاء اختيار استراتيجية');
      return;
    }
    
    if (selectedPairs.length === 0) {
      toast.error('الرجاء اختيار زوج تداول واحد على الأقل');
      return;
    }
    
    setIsLoading(true);
    try {
      // تحديث مفاتيح API إذا كانت متوفرة
      if (apiKey && apiSecret) {
        await updateApiKeys();
      }
      
      // تحديث إعدادات التداول
      const response = await fetch(ENDPOINTS.UPDATE_SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_type: 'trading_settings',
          strategy: selectedStrategy,
          pairs: selectedPairs,
          api_key: apiKey,
          api_secret: apiSecret
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('تم حفظ إعدادات التداول بنجاح');
        
        // إضافة تنبيه بنجاح الحفظ
        setAlerts(prev => [{
          type: 'info',
          message: 'تم تحديث إعدادات التداول',
          time: new Date().toLocaleTimeString(),
          pair: null,
          price: null
        }, ...prev]);
        
        // إذا كان البوت يعمل، نقوم بإعادة تشغيله مع الإعدادات الجديدة
        if (botStatus === 'running') {
          await updateBotStatus('start');
        }
      } else {
        throw new Error(data.detail || 'حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast.error(`خطأ: ${error.message}`);
      
      // إضافة تنبيه بالخطأ
      setAlerts(prev => [{
        type: 'error',
        message: `خطأ في حفظ الإعدادات: ${error.message}`,
        time: new Date().toLocaleTimeString()
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.UPDATE_SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: apiKey, 
          api_secret: apiSecret,
          update_type: 'api_keys' // To identify this is an API key update
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('تم تحديث مفاتيح API بنجاح');
        setMessage('تم تحديث مفاتيح API بنجاح');
        
        // Add alert for the update
        setAlerts(prev => [{
          type: 'info',
          message: 'تم تحديث مفاتيح API',
          time: new Date().toLocaleTimeString(),
        }, ...prev]);
        
        // Refresh activation status
        await checkActivation();
      } else {
        throw new Error(data.detail || 'فشل تحديث مفاتيح API');
      }
    } catch (error) {
      console.error('Error updating API keys:', error);
      toast.error(`خطأ: ${error.message}`);
      setMessage(`خطأ: ${error.message}`);
      
      // Add error alert
      setAlerts(prev => [{
        type: 'error',
        message: `خطأ في تحديث المفاتيح: ${error.message}`,
        time: new Date().toLocaleTimeString(),
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBotStatus = async (status) => {
    setIsLoading(true);
    setMessage(status === 'start' ? 'جاري تشغيل البوت...' : 'جاري إيقاف البوت...');
    
    try {
      const res = await fetch(ENDPOINTS.BOT_STATUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          strategy: selectedStrategy,
          pairs: selectedPairs
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const newStatus = status === 'start' ? 'running' : 'stopped';
        setBotStatus(newStatus);
        setIsActivated(newStatus === 'running');
        
        const statusMessage = newStatus === 'running' 
          ? 'تم تشغيل البوت بنجاح' 
          : 'تم إيقاف البوت بنجاح';
          
        setMessage(statusMessage);
        toast.success(statusMessage);
        
        // Add alert for the status change
        setAlerts(prev => [{
          type: 'info',
          message: statusMessage,
          time: new Date().toLocaleTimeString(),
          pair: null,
          price: null
        }, ...prev]);
        
        // If starting, fetch the latest balances
        if (newStatus === 'running') {
          await fetchBalance();
        }
      } else {
        throw new Error(data.detail || 'فشل تحديث حالة البوت');
      }
    } catch (error) {
      console.error('Error updating bot status:', error);
      const errorMessage = `خطأ: ${error.message}`;
      setMessage(errorMessage);
      toast.error(errorMessage);
      
      // Add error alert
      setAlerts(prev => [{
        type: 'error',
        message: errorMessage,
        time: new Date().toLocaleTimeString()
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!apiKey || !apiSecret) {
      console.log('No API keys available to fetch balance');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.BALANCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          api_secret: apiSecret
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Filter out zero balances and format the data
        const formattedBalances = Object.entries(data.balances || {})
          .filter(([_, balance]) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
          .map(([asset, balance]) => ({
            asset,
            free: parseFloat(balance.free),
            locked: parseFloat(balance.locked),
            total: parseFloat(balance.free) + parseFloat(balance.locked)
          }));
          
        setBalances(formattedBalances);
        
        // Add alert for balance update
        setAlerts(prev => [{
          type: 'info',
          message: 'تم تحديث رصيد المحفظة',
          time: new Date().toLocaleTimeString(),
          pair: null,
          price: null
        }, ...prev]);
      } else {
        throw new Error(data.detail || 'فشل تحميل رصيد المحفظة');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      const errorMessage = `خطأ في جلب الرصيد: ${error.message}`;
      setMessage(errorMessage);
      toast.error(errorMessage);
      
      // Add error alert
      setAlerts(prev => [{
        type: 'error',
        message: errorMessage,
        time: new Date().toLocaleTimeString()
      }, ...prev]);
    } finally {
      setIsLoading(false);
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
        if (data.selected_pairs) setSelectedPairs(data.selected_pairs);
        if (data.strategy) setSelectedStrategy(data.strategy);
        if (data.bot_status) setBotStatus(data.bot_status);
      }
      return data.activated || false;
    } catch (error) {
      console.error('خطأ في التحقق من حالة التنشيط:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // جلب قائمة الاستراتيجيات
        const strategiesRes = await fetch(ENDPOINTS.GET_STRATEGIES);
        if (strategiesRes.ok) {
          const strategiesData = await strategiesRes.json();
          setStrategies(strategiesData);
          if (strategiesData.length > 0) {
            setSelectedStrategy(strategiesData[0].id);
          }
        }

        // جلب قائمة أزواج التداول
        const pairsRes = await fetch(ENDPOINTS.GET_PAIRS);
        if (pairsRes.ok) {
          const pairsData = await pairsRes.json();
          setTradingPairs(pairsData);
        }

        // التحقق من حالة التنشيط
        const isActivated = await checkActivation();
        
        // إذا كان البوت مفعل، نقوم بجلب أحدث الأرصدة
        if (isActivated && apiKey && apiSecret) {
          await fetchBalance();
        }
      } catch (error) {
        console.error('خطأ في تحميل البيانات الأولية:', error);
        toast.error('حدث خطأ أثناء تحميل البيانات الأولية');
        
        // إضافة تنبيه بالخطأ
        setAlerts(prev => [{
          type: 'error',
          message: `خطأ في تحميل البيانات: ${error.message}`,
          time: new Date().toLocaleTimeString()
        }, ...prev]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // مصفوفة التبعيات الفارغة تعني أن هذا التأثير يعمل مرة واحدة عند تحميل المكون

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-6">Power MS Trading Pro</h1>
        
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-2 rounded flex items-center ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <i className="fas fa-tachometer-alt ml-2"></i>
            لوحة التحكم
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-2 rounded flex items-center ${activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <i className="fas fa-cog ml-2"></i>
            الإعدادات
          </button>
          
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`w-full text-left px-4 py-2 rounded flex items-center ${activeTab === 'alerts' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <i className="fas fa-bell ml-2"></i>
            التنبيهات
            {alerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                {alerts.length}
              </span>
            )}
          </button>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-300">حالة البوت:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${isActivated ? 'bg-green-500' : 'bg-red-500'}`}>
              {isActivated ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => updateBotStatus('start')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'جاري...' : 'تشغيل'}
            </button>
            <button 
              onClick={() => updateBotStatus('stop')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
              disabled={isLoading}
            >
              إيقاف
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <RiskManagementPanel />
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-6">لوحة التحكم</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">الاستراتيجية المختارة</h3>
                  <p className="text-lg font-semibold">
                    {selectedStrategy || 'لم يتم اختيار استراتيجية'}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">عدد الأزواج المختارة</h3>
                  <p className="text-lg font-semibold">
                    {selectedPairs.length} زوج
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">حالة البوت</h3>
                  <p className={`text-lg font-semibold ${isActivated ? 'text-green-600' : 'text-red-600'}`}>
                    {isActivated ? 'يعمل' : 'متوقف'}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">الأزواج المختارة</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPairs.length > 0 ? (
                    selectedPairs.map((pair, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {pair}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">لم يتم اختيار أي أزواج بعد</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-6">إعدادات التداول</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">اختر الاستراتيجية</h3>
                  <select 
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- اختر استراتيجية --</option>
                    <option value="rsi_macd">RSI + MACD</option>
                    <option value="bollinger">Bollinger Bands</option>
                    <option value="ma_crossover">Moving Average Crossover</option>
                    <option value="stoch_rsi">Stochastic RSI</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    اختر استراتيجية التداول المفضلة لديك
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">أزواج التداول</h3>
                  <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                    {tradingPairs.length > 0 ? (
                      tradingPairs.map((pair) => (
                        <label key={pair.symbol} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedPairs.includes(pair.symbol)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPairs([...selectedPairs, pair.symbol]);
                              } else {
                                setSelectedPairs(selectedPairs.filter(p => p !== pair.symbol));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="mr-2">{pair.symbol}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">جاري تحميل أزواج التداول...</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">إعدادات المخاطرة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نسبة المخاطرة لكل صفقة (%)
                    </label>
                    <input 
                      type="number" 
                      min="0.1" 
                      max="10" 
                      step="0.1"
                      defaultValue="1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نسبة جني الأرباح (%)
                    </label>
                    <input 
                      type="number" 
                      min="0.5" 
                      max="100" 
                      step="0.1"
                      defaultValue="2"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نسبة وقف الخسارة (%)
                    </label>
                    <input 
                      type="number" 
                      min="0.1" 
                      max="10" 
                      step="0.1"
                      defaultValue="1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => saveSettings()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">إعدادات API</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    مفتاح API
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="أدخل مفتاح API الخاص بك"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السر السري (Secret Key)
                  </label>
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="أدخل السر السري الخاص بك"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={updateApiKeys}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري التحديث...' : 'حفظ مفاتيح API'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'alerts' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6">إدارة التنبيهات</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">إعدادات التنبيهات</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-4 w-4 text-blue-600"
                    defaultChecked
                  />
                  <span className="mr-2">تفعيل التنبيهات الصوتية</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-4 w-4 text-blue-600"
                    defaultChecked
                  />
                  <span className="mr-2">إشعارات الدخول في صفقة</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-4 w-4 text-blue-600"
                    defaultChecked
                  />
                  <span className="mr-2">إشعارات إغلاق الصفقة</span>
                </label>
                
                <div className="pt-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">سجل التنبيهات</h3>
              {alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.type === 'buy' ? 'border-green-500 bg-green-50' : 
                        alert.type === 'sell' ? 'border-red-500 bg-red-50' : 
                        'border-yellow-500 bg-yellow-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{alert.message}</span>
                        <span className="text-sm text-gray-500">{alert.time}</span>
                      </div>
                      {alert.pair && (
                        <div className="text-sm text-gray-600 mt-1">
                          {alert.pair} - {alert.price ? `السعر: ${alert.price}` : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-bell-slash text-3xl mb-2"></i>
                  <p>لا توجد تنبيهات حتى الآن</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
