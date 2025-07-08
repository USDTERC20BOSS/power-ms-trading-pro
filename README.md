# Power MS Trading Pro

تطبيق ويب متكامل لإدارة التداول الآلي في منصة Binance.

## المميزات

- واجهة مستخدم تفاعلية
- إدارة المخاطر المتقدمة
- دعم تعدد الاستراتيجيات
- تحليلات فورية
- إشعارات فورية

## متطلبات النشر

### Frontend (Netlify)

- Node.js 18+
- npm 9+

### Backend (Render)
- Python 3.9+
- PostgreSQL (يتم توفيره تلقائياً على Render)

## خطوات النشر

### 1. نشر الباكند على Render

1. قم بإنشاء حساب على [Render](https://render.com/)
2. انقر على "New" ثم اختر "Web Service"
3. قم برفع مستودع GitHub الخاص بك
4. اختر Python 3.9 كبيئة
5. أدخل الأوامر التالية:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
   ```
6. قم بإضافة متغيرات البيئة من ملف `.env`
7. انقر على "Create Web Service"

### 2. نشر الفرونتاند على Netlify

1. قم بإنشاء حساب على [Netlify](https://www.netlify.com/)
2. اختر "Import an existing project"
3. اختر GitHub وقم بتحديد المستودع
4. أدخل إعدادات البناء التالية:
   ```
   Build command: npm run build
   Publish directory: build
   ```
5. أضف متغير البيئة التالي:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-render-app-url.onrender.com` (استبدل بالرابط الفعلي لتطبيق Render)
6. انقر على "Deploy site"

## التطوير المحلي

### إعداد البيئة

1. استنسخ المستودع
2. قم بتثبيت متطلبات الباكند:
   ```bash
   pip install -r requirements.txt
   ```
3. قم بتثبيت متطلبات الفرونتاند:
   ```bash
   cd frontend
   npm install
   ```

### تشغيل التطبيق

1. قم بتشغيل الباكند:
   ```bash
   uvicorn main:app --reload
   ```

2. قم بتشغيل الفرونتاند:
   ```bash
   cd frontend
   npm start
   ```

## الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).
