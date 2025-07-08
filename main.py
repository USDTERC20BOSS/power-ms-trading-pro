
from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import json
from binance.client import Client
import pandas as pd

SQLALCHEMY_DATABASE_URL = "sqlite:///./power_ms.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    activation_code = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=False)
    api_key = Column(String, nullable=True)
    api_secret = Column(String, nullable=True)
    settings = Column(String, default="{}")
    bot_status = Column(String, default="stopped")
    last_ip = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Power MS Trading Pro Backend")

class ActivationRequest(BaseModel):
    activation_code: str

class SettingsUpdate(BaseModel):
    api_key: str = None
    api_secret: str = None
    settings: dict = {}

class BotStatusUpdate(BaseModel):
    status: str

class BalanceResponse(BaseModel):
    asset: str
    free: float
    locked: float

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

VALID_ACTIVATION_CODE = "POWERMS2025"

@app.post("/activate")
def activate_user(req: ActivationRequest, db: Session = Depends(get_db), request: Request = None):
    if req.activation_code != VALID_ACTIVATION_CODE:
        raise HTTPException(status_code=400, detail="Code d'activation incorrect")
    user = db.query(User).filter(User.activation_code == req.activation_code).first()
    if user and user.is_active:
        return {"message": "Utilisateur déjà activé"}
    if not user:
        user = User(activation_code=req.activation_code, is_active=True)
        db.add(user)
    else:
        user.is_active = True
    if request:
        user.last_ip = request.client.host
    db.commit()
    return {"message": "Activation réussie"}

@app.post("/update_settings")
def update_settings(req: SettingsUpdate, db: Session = Depends(get_db), request: Request = None):
    user = db.query(User).filter(User.activation_code == VALID_ACTIVATION_CODE).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Utilisateur non activé")
    if req.api_key:
        user.api_key = req.api_key
    if req.api_secret:
        user.api_secret = req.api_secret
    if req.settings:
        user.settings = json.dumps(req.settings)
    if request:
        user.last_ip = request.client.host
    db.commit()
    return {"message": "Paramètres mis à jour avec succès"}

@app.get("/get_settings")
def get_settings(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.activation_code == VALID_ACTIVATION_CODE).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Utilisateur non activé")
    return {
        "api_key": user.api_key,
        "api_secret": user.api_secret,
        "settings": json.loads(user.settings),
        "bot_status": user.bot_status,
        "last_ip": user.last_ip
    }

@app.post("/bot_status")
def set_bot_status(req: BotStatusUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.activation_code == VALID_ACTIVATION_CODE).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Utilisateur non activé")
    if req.status not in ["running", "stopped"]:
        raise HTTPException(status_code=400, detail="Status non valide")
    user.bot_status = req.status
    db.commit()
    return {"message": f"Statut du bot mis à jour à {req.status}"}

@app.get("/binance_balance", response_model=list[BalanceResponse])
def get_binance_balance(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.activation_code == VALID_ACTIVATION_CODE).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Utilisateur non activé")
    if not user.api_key or not user.api_secret:
        raise HTTPException(status_code=400, detail="API keys manquantes")
    try:
        client = Client(user.api_key, user.api_secret)
        account_info = client.get_account()
        balances = account_info['balances']
        result = []
        for bal in balances:
            free = float(bal['free'])
            locked = float(bal['locked'])
            if free > 0 or locked > 0:
                result.append(BalanceResponse(asset=bal['asset'], free=free, locked=locked))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Binance API: {str(e)}")


def calculate_rsi(data, window=14):
    delta = data['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

@app.post("/predict_signal")
def predict_signal(prices: list):
    import pandas as pd
    df = pd.DataFrame(prices)
    df['rsi'] = calculate_rsi(df)
    last_rsi = df['rsi'].iloc[-1]
    if last_rsi < 30:
        return {"signal": "achat", "rsi": last_rsi}
    elif last_rsi > 70:
        return {"signal": "vente", "rsi": last_rsi}
    else:
        return {"signal": "neutre", "rsi": last_rsi}
