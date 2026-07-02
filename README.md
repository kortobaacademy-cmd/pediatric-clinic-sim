# عيادة التدريب — نسخة مستقلة (Vercel)

تطبيق تدريب تفاعلي على حالات أطفال، بالصوت والنص، شغال برة Claude artifacts عشان المايك (STT) يشتغل 100%.

## هيكل المشروع

```
pediatric-clinic-sim/
├── index.html        ← الواجهة (React عن طريق CDN، بدون خطوة build)
├── api/
│   └── claude.js      ← دالة Serverless بتحمي الـ API key وتعمل proxy لـ Anthropic
├── package.json
└── README.md
```

## ليه محتاج backend؟

عشان تقدر تستدعي Claude API من المتصفح، المفروض تحط الـ API key في الكود — وده معناه أي حد فاتح صفحتك يقدر ياخده وينسخه ويستخدمه على حسابك. الدالة اللي في `api/claude.js` بتشتغل على السيرفر (مش في متصفح المستخدم)، وبتاخد الـ key من environment variable، فمفيش أي مكان في الكود اللي بيوصله المتصفح يشوف الـ key.

## خطوات النشر على Vercel (مجانًا)

### 1. جهّز الملفات على GitHub
- اعمل repo جديد على GitHub (public أو private، فرق بسيط).
- ارفع الفولدر ده كله (`index.html`, `api/claude.js`, `package.json`) على الـ repo.

### 2. اربط الـ repo بـ Vercel
- روح على [vercel.com](https://vercel.com) واعمل حساب (تقدر تسجل دخول بـ GitHub على طول).
- دوس **Add New → Project**.
- اختار الـ repo اللي رفعته.
- Framework Preset: سيبه **Other** (مفيش build step، الملفات هتتنشر زي ما هي).
- دوس **Deploy**.

### 3. ضيف الـ API key (الخطوة الأهم)
- بعد ما المشروع يتعمل، روح على **Project → Settings → Environment Variables**.
- ضيف variable جديد:
  - **Name:** `ANTHROPIC_API_KEY`
  - **Value:** الـ API key بتاعك (تقدر تجيبه من [console.anthropic.com](https://console.anthropic.com))
  - **Environment:** Production (و Preview لو حابب تجرب قبل النشر النهائي)
- (اختياري لكن منصوح بيه) ضيف variable تاني عشان محدش يستخدم الرابط غيرك:
  - **Name:** `APP_SECRET`
  - **Value:** أي كلمة سر طويلة من اختيارك (مثلاً `athar-clinic-2026-xyz123`)
- بعد ما تضيفهم، روح على تاب **Deployments** ودوس **Redeploy** عشان الـ variables تتفعّل.

### 4. لو استخدمت APP_SECRET
لازم تضيفه في `index.html` نفسه عشان الفرونت إند يبعته مع كل طلب. افتح `index.html` ودوّر على السطر ده تحت (قبل الـ `<script type="text/babel">`):

```html
<script>
  window.APP_SECRET = "حط هنا نفس القيمة اللي حطيتها في Vercel";
</script>
```

لو مش عايز الحماية دي دلوقتي، سيب الأمر زي ما هو وامسح الـ `APP_SECRET` variable من Vercel، والتطبيق هيشتغل عادي بدون كلمة سر (أي حد عنده الرابط يقدر يستخدمه).

### 5. جرّب التطبيق
- الرابط هيبقى شكله `https://pediatric-clinic-sim.vercel.app` (أو أي اسم Vercel هيديهولك).
- افتحه على Chrome، وافق على إذن المايك لما يطلبه، وجرّب.
- المايك (STT) والصوت (TTS) المفروض يشتغلوا عادي دلوقتي لأن مفيش iframe مقيّد.

## ملاحظات

- **التكلفة:** كل مكالمة لـ Claude API بتتحسب على حسابك في Anthropic Console (مش مجانية زي Vercel نفسه). لو هتبعته لطلاب كتير، تابع الاستهلاك من [console.anthropic.com](https://console.anthropic.com/settings/usage).
- **الصوت العربي:** لسه بيعتمد على نظام تشغيل الجهاز اللي بيفتح منه المستخدم (زي ما اتفقنا قبل كده) — مفيش حل تقني لده غير استخدام خدمة TTS خارجية لو حبيت جودة صوت أفضل وموحدة لكل المستخدمين.
- **التعديل على الكود:** كل حاجة في `index.html` هي نفس منطق التطبيق الأصلي بالظبط، غيّرنا بس مصدر استدعاء الـ API ونظام تخزين السجل (`localStorage` بدل `window.storage`).
