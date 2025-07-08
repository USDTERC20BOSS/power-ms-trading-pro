#!/bin/bash

# تنشيط البيئة الافتراضية (اختياري)
# source venv/bin/activate

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الخادم
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
