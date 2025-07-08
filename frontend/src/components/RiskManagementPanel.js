import React, { useState, useEffect } from 'react';
import { FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RiskManagementPanel = ({ apiBaseUrl }) => {
  const [takeProfit, setTakeProfit] = useState(5);
  const [stopLoss, setStopLoss] = useState(1);
  const [maxRisk, setMaxRisk] = useState(2);
  const [trailingStop, setTrailingStop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // جلب إعدادات المخاطرة المحفوظة عند تحميل المكون
    const fetchRiskSettings = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/get_settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.risk_settings) {
            setTakeProfit(data.risk_settings.take_profit || 5);
            setStopLoss(data.risk_settings.stop_loss || 1);
            setMaxRisk(data.risk_settings.max_risk || 2);
            setTrailingStop(data.risk_settings.trailing_stop || false);
          }
        }
      } catch (error) {
        console.error('Error fetching risk settings:', error);
      }
    };
    
    fetchRiskSettings();
  }, [apiBaseUrl]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/update_risk_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          take_profit: takeProfit,
          stop_loss: stopLoss,
          max_risk: maxRisk,
          trailing_stop: trailingStop,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success('✅ تم حفظ إعدادات المخاطرة بنجاح');
      } else {
        throw new Error(data.detail || 'فشل في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving risk settings:', error);
      toast.error(`❌ ${error.message || 'حدث خطأ أثناء حفظ الإعدادات'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSlider = (value, setValue, min, max, step, color) => ({
    background: `linear-gradient(90deg, ${color} ${((value - min) / (max - min)) * 100}%, #444 ${((value - min) / (max - min)) * 100}%)`
  });

  return (
    <div className="card risk-management">
      <div className="card-header">
        <FaChartLine className="icon" />
        <h3>إدارة المخاطر</h3>
      </div>
      
      <div className="card-body">
        <div className="form-group">
          <div className="slider-header">
            <label>Take Profit: <span className="value">{takeProfit}%</span></label>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              min="0.1" 
              max="50" 
              step="0.1" 
              value={takeProfit} 
              onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
              className="slider"
              style={renderSlider(takeProfit, 0.1, 50, 0.1, 'var(--primary-color)')}
            />
            <div className="slider-ticks">
              {[0.1, 5, 10, 25, 50].map((tick) => (
                <span 
                  key={tick} 
                  className={tick <= takeProfit ? 'active' : ''}
                  onClick={() => setTakeProfit(tick)}
                >
                  {tick}%
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="slider-header">
            <label>Stop Loss: <span className="value">{stopLoss}%</span></label>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.1" 
              value={stopLoss} 
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
              className="slider"
              style={renderSlider(stopLoss, 0.1, 5, 0.1, 'var(--danger-color)')}
            />
            <div className="slider-ticks">
              {[0.1, 1, 2, 3, 5].map((tick) => (
                <span 
                  key={tick}
                  className={tick <= stopLoss ? 'active' : ''}
                  onClick={() => setStopLoss(tick)}
                >
                  {tick}%
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="slider-header">
            <label>المخاطرة القصوى لكل صفقة: <span className="value">{maxRisk}%</span></label>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.1" 
              value={maxRisk} 
              onChange={(e) => setMaxRisk(parseFloat(e.target.value))}
              className="slider"
              style={renderSlider(maxRisk, 0.1, 5, 0.1, 'var(--secondary-color)')}
            />
            <div className="slider-ticks">
              {[0.1, 1, 2, 3, 5].map((tick) => (
                <span 
                  key={tick}
                  className={tick <= maxRisk ? 'active' : ''}
                  onClick={() => setMaxRisk(tick)}
                >
                  {tick}%
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label className={`custom-checkbox ${trailingStop ? 'checked' : ''}`}>
            <input 
              type="checkbox" 
              checked={trailingStop} 
              onChange={(e) => setTrailingStop(e.target.checked)}
              hidden
            />
            <span className="checkmark"></span>
            <span className="label-text">تفعيل التريلينج ستوب</span>
            <span className="info-icon" title="يسمح بتعديل وقف الخسارة تلقائياً مع تحرك السعر لصالحك">
              <FaInfoCircle />
            </span>
          </label>
        </div>

        <button 
          className={`btn btn-primary save-btn ${isLoading ? 'loading' : ''}`} 
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          {isLoading ? 'جاري الحفظ...' : 'حفظ إعدادات المخاطرة'}
        </button>

        <div className="risk-info">
          <h4>كيف تعمل إعدادات المخاطرة:</h4>
          <ul>
            <li>
              <strong>Take Profit ({takeProfit}%):</strong>
              <span>سيتم إغلاق الصفقة تلقائياً عند تحقيق ربح بنسبة {takeProfit}% من سعر الدخول.</span>
            </li>
            <li>
              <strong>Stop Loss ({stopLoss}%):</strong>
              <span>سيتم إغلاق الصفقة تلقائياً عند خسارة {stopLoss}% من رأس المال المستثمر.</span>
            </li>
            <li>
              <strong>نسبة المخاطرة ({maxRisk}%):</strong>
              <span>أقصى مبلغ يمكن خسارته في كل صفقة كنسبة من رأس المال.</span>
            </li>
            <li>
              <strong>التريلينج ستوب:</strong>
              <span>يسمح بتعديل وقف الخسارة تلقائياً مع تحرك السعر لصالحك لتأمين الأرباح.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RiskManagementPanel;
