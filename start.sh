#!/bin/bash

# تثبيت المتطلبات
pip install -r requirements.txt

# إنشاء مجلد الثوابت
mkdir -p static

# تشغيل الخادم باستخدام Gunicorn
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4 --worker-class uvicorn.workers.UvicornWorker
