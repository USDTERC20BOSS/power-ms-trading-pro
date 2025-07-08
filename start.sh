#!/bin/bash

# تحديث pip
python -m pip install --upgrade pip

# تثبيت setuptools و wheel
pip install --upgrade setuptools wheel

# تثبيت المتطلبات
pip install -r requirements.txt

# إنشاء مجلد الثوابت
mkdir -p static

# تشغيل الخادم باستخدام Gunicorn
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
