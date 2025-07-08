from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
import json
import os

router = APIRouter()

# نموذج البيانات الواردة
class RiskSettings(BaseModel):
    takeProfit: float
    stopLoss: float
    maxRiskPerTrade: float
    trailingStop: bool
    trailingStopDistance: float

# مسار ملف حفظ الإعدادات
SETTINGS_FILE = "risk_settings.json"

# تحميل الإعدادات الحالية
def load_settings() -> Dict:
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading settings: {e}")
    return {}

# حفظ الإعدادات الجديدة
def save_settings(settings: Dict):
    try:
        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving settings: {e}")
        return False

# نقطة النهاية لحفظ إعدادات المخاطر
@router.post("/update_risk_settings")
async def update_risk_settings(settings: RiskSettings):
    try:
        # تحويل النموذج إلى قاموس
        settings_dict = settings.dict()
        
        # حفظ الإعدادات في الملف
        if save_settings(settings_dict):
            return {
                "status": "success",
                "message": "تم تحديث إعدادات المخاطر بنجاح",
                "settings": settings_dict
            }
        else:
            raise HTTPException(status_code=500, detail="فشل في حفظ الإعدادات")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# نقطة النهاية لجلب إعدادات المخاطر الحالية
@router.get("/get_risk_settings")
async def get_risk_settings():
    try:
        settings = load_settings()
        return {
            "status": "success",
            "settings": settings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في جلب الإعدادات: {str(e)}")

# يمكنك استيراد هذا الراوتر في ملف main.py الرئيسي
