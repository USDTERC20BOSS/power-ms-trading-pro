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
    // Récupérer les paramètres de risque enregistrés lors du chargement du composant
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
        console.error('Erreur lors de la récupération des paramètres de risque:', error);
        toast.error('Erreur lors du chargement des paramètres de risque');
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
          'Accept-Language': 'fr'
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
        toast.success('Paramètres de risque enregistrés avec succès');
      } else {
        throw new Error(data.detail || 'Échec de l\'enregistrement des paramètres');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des paramètres de risque:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'enregistrement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="risk-management-panel">
      <div className="panel-header">
        <FaChartLine className="header-icon" />
        <h2>Gestion des Risques</h2>
      </div>
      
      <div className="form-container">
        <div className="form-group">
          <label>Objectif de profit (%)</label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(Number(e.target.value))}
            min="0.1"
            step="0.1"
            className="form-control"
          />
          <small>Pourcentage de profit cible pour chaque transaction</small>
        </div>
        
        <div className="form-group">
          <label>Stop-loss (%)</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
            min="0.1"
            step="0.1"
            className="form-control"
          />
          <small>Pourcentage de perte maximale par rapport au capital</small>
        </div>
        
        <div className="form-group">
          <label>Risque maximum (%)</label>
          <input
            type="number"
            value={maxRisk}
            onChange={(e) => setMaxRisk(Number(e.target.value))}
            min="0.1"
            max="100"
            step="0.1"
            className="form-control"
          />
          <small>Pourcentage maximal de risque sur le capital total</small>
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
            <span className="label-text">Activer le stop-loss suiveur</span>
            <div className="info-tooltip">
              <FaInfoCircle />
              <span className="tooltip-text">
                Lorsqu'il est activé, le stop-loss se déplace avec le prix pour verrouiller les bénéfices
              </span>
            </div>
          </label>
        </div>
        
        <button 
          className={`btn btn-primary save-btn ${isLoading ? 'loading' : ''}`} 
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
        
        <div className="risk-info">
          <h4>Fonctionnement des paramètres de risque :</h4>
          <ul>
            <li>
              <strong>Take Profit ({takeProfit}%) :</strong>
              <span> La position sera clôturée automatiquement lorsque le profit atteindra {takeProfit}% du prix d'entrée.</span>
            </li>
            <li>
              <strong>Stop Loss ({stopLoss}%) :</strong>
              <span> La position sera clôturée automatiquement en cas de perte de {stopLoss}% du capital investi.</span>
            </li>
            <li>
              <strong>Risque maximum ({maxRisk}%) :</strong>
              <span> Montant maximal pouvant être perdu sur chaque transaction en pourcentage du capital.</span>
            </li>
            <li>
              <strong>Stop-loss suiveur :</strong>
              <span> Ajuste automatiquement le niveau du stop-loss pour protéger les bénéfices au fur et à mesure que le prix évolue en votre faveur.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RiskManagementPanel;
