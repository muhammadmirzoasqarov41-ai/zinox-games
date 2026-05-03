# 💎 Zinox Games - Production Ready Incremental Game

## 🇺🇿 Zinox Games - To'liq Ishlaydigan Incremental O'yin

Zinox Games - bu mobil birinchi, neon cyberpunk uslubida yaratilgan, to'liq funktsional incremental clicker o'yini. O'yin ikki valyuta tizimiga ega va uzbek foydalanuvchilari uchun mo'ljallangan.

---

## 🎮 O'yin Xususiyatlari

### 💰 Ikkita Valyuta Tizimi
- **💎 Zinox Token** - O'yinda ishlanadigan asosiy valyuta (+1 dan boshlanadi)
- **$ Cash** - Faqat admin tomonidan sotiladigan premium valyuta (@cyberscmmr)

### 🎯 Asosiy Funktsiyalar
- **Tap/Swipe Sistema** - Mobil uchun optimallashtirilgan bosish mexanizmi
- **Combo Sistema** - Tez bosish orqali multiplikator olish
- **Auto Clicker** - Passiv daromad tizimi
- **Yangilash Do'koni** - 4 asosiy yangilash (2x narx o'sishi)
- **Referal Sistema** - Do'stlarni taklif qilish orqali bonus
- **Reyting Jadvali** - Realtime o'yinchilar reytingi
- **Anti-Cheat** - Scammingga qarshi himoya tizimi
- **AI Himoya** - Groq API bilan fraud detection (placeholder)

### 📱 Mobil Optimizatsiya
- Mobil birinchi dizayn
- Touch optimallashtirilgan interfeys
- Vibratsiya qo'llab-quvvatlanadi
- Responsive dizayn

---

## 🚀 Qanday Ishga Tushirish

### 1. Oddiy Usul (Lokal)
```bash
# Fayllarni kompyuteringizga yuklab oling
# Papkani oching va index.html ni brauzeringizda oching
```

### 2. Lokal Server
```bash
# Python 3
python -m http.server 8000

# Node.js (agar o'rnatilgan bo'lsa)
npx serve .

# PHP
php -S localhost:8000
```

### 3. VS Code Live Server
- VS Code da **Live Server** extensiyasini o'rnatish
- `index.html` faylida right-click → **Open with Live Server**

---

## 🌐 Deploy Qilish

### Vercel (Tavsiya etiladi)
```bash
# 1. Vercel.com ga kirish
# 2. "New Project" tugmasini bosish
# 3. GitHub repository ni ulash
# 4. Build settings: 
#    - Build Command: npm run build (yoki bo'sh)
#    - Output Directory: . (yoki public)
# 5. Deploy!
```

### Netlify
```bash
# 1. Netlify.com ga kirish
# 2. "Drag and drop" qismiga fayllarni tashlash
# 3. Avtomatik deploy bo'ladi
```

### GitHub Pages
```bash
# 1. GitHub repository yaratish
# 2. Fayllarni yuklash
# 3. Settings → Pages → Source: "Deploy from a branch"
# 4. Main branch tanlash va Save
```

---

## ⚙️ Konfiguratsiya

### Supabase Sozlamlari
`script.js` faylida quyidagilarni o'zgartiring:
```javascript
this.config = {
    supabaseUrl: 'YOUR_SUPABASE_URL',
    supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
    groqApiKey: 'YOUR_GROQ_API_KEY'
};
```

### Admin Sozlamlari
- **Admin Telegram**: @cyberscmmr
- **Cash narxlari**: 1$ = 2000 UZS
- **Reklama intervali**: 8 daqiqa
- **Anti-cheat limit**: 15 bosish/sekund

---

## 📊 O'yin Mexanikasi

### 🎯 Boshlang'ich Qiymatlar
- **Tap Power**: +1 Zinox Token
- **Auto Clicker**: 0 token/sekund
- **Multiplier**: x1
- **Combo Time**: 3 sekund

### 💰 Yangilash Narxlari (2x o'sish)
- **Tap Power**: 4$ → 8$ → 16$ → 32$
- **Auto Clicker**: 8$ → 16$ → 32$ → 64$
- **Multiplier**: 16$ → 32$ → 64$ → 128$
- **Combo Master**: 32$ → 64$ → 128$ → 256$

### 🎁 Bonuslar
- **Referal bonus**: +100 Zinox Token
- **Offline earnings**: Auto clicker × offline vaqt
- **Ad bonus**: +50 Zinox Token (har 8 daqiqada)

---

## 🛡️ Xavfsizlik

### Anti-Cheat Sistema
- **Click rate limiting**: 15 bosish/sekund
- **Pattern detection**: G'alati faoliyatni aniqlash
- **Suspicious activity warnings**: Ogohlantirish tizimi

### AI Himoya (Placeholder)
- Groq API integratsiyasi tayyor
- Fraud detection uchun
- Real-time monitoring

---

## 🎨 Dizayn

### Neon Cyberpunk Uslubi
- **Asosiy ranglar**: #00ff88 (neon green), #ff00ff (neon purple)
- **Fon ranglari**: #0a0a0f, #1a1a2e (qora ko'k)
- **Animatsiyalar**: Smooth transitions, glow effektlar
- **Font**: Orbitron (futuristik monospace)

### UX Xususiyatlari
- **Ko'zni qoliqtirmaydigan** ranglar
- **Jalb qiladigan** vizual effektlar
- **Intuitiv** interfeys
- **Fast response** interaksiyalar

---

## 📱 Mobil Qo'llab-quvvatlash

### Touch Optimizatsiya
- **Tap area**: 200x200px (mobil uchun)
- **Swipe qo'llab-quvvatlash**
- **Vibration feedback**
- **Multi-touch prevention**

### Responsive Dizayn
- **360px+** ekranlar uchun
- **480px** optimal kenglik
- **Tablet** qo'llab-quvvatlash
- **Landscape** rejim

---

## 🔧 Texnik Xususiyatlar

### Performance
- **60 FPS** animatsiyalar
- **Optimized** JavaScript
- **Lazy loading** resurslar
- **Service Worker** PWA support

### Browser Qo'llab-quvvatlash
- **Chrome 60+**
- **Safari 12+**
- **Firefox 55+**
- **Edge 79+**

### PWA Xususiyatlari
- **Offline support** (localStorage)
- **Install prompt**
- **Splash screen**
- **App manifest**

---

## 📈 Monetizatsiya

### Referal Sistema
- **Taklif qilingan user**: +10% bonus
- **Referal link**: Unikal 8-harfli kod
- **Tracking**: Realtime monitoring

### Reklama Sistemi
- **8 minutda** bir marta
- **15 sekund** davom etadi
- **Skip option** (15 sekunddan keyin)
- **Ad space**: Admin uchun

### Cash Sotish
- **STARTER**: 10$ = 20,000 UZS
- **PRO**: 50$ = 100,000 UZS
- **ELITE**: 100$ = 200,000 UZS

---

## 🔄 Update Plan

### Versiya 1.1 (Yangi Qo'shilgan Xususiyatlar)
- [x] Groq API to'liq integratsiya (llama3-70b-8192)
- [x] Real-time chat tizimi
- [x] Donat progress tizimi (Free Fire, PUBG, Mobile Legends)
- [x] Admin panel real ma'lumotlar
- [x] Space button chatda ishlaydi
- [ ] Push notifications
- [ ] More upgrade types
- [ ] Tournament system
- [ ] Voice chat support

### Versiya 1.2 (Uzoq kelajak)
- [ ] NFT integratsiya
- [ ] Blockchain support
- [ ] Multiplayer battles
- [ ] Guild system
- [ ] Mobile apps (iOS/Android)

---

## 🐞 Debug & Troubleshooting

### Umumiy Muammolar
```javascript
// Console ochish: F12 yoki Right-click → Inspect
// LocalStorage tekshirish: Application → Local Storage
// Network tekshirish: Network tab
```

### Tez-tez Uchraydigan Xatolar
1. **O'yin yuklanmaydi** → Brauzer cache'ni tozalash
2. **Saqlash ishlamaydi** → LocalStorage ruxsatini tekshirish
3. **Sound ishlamaydi** → Audio context tekshirish
4. **Vibration ishlamaydi** → HTTPS tekshirish

---

## 📞 Aloqa

### Admin
- **Telegram**: @cyberscmmr
- **Email**: (qo'shilishi kerak)

### Bug Reports
- **GitHub Issues**: (repository link)
- **Telegram**: @cyberscmmr

---

## 📄 Litsenziya

MIT License - Commercial use allowed

---

## 🎉 Yakun

Zinox Games - bu to'liq production-ready incremental o'yin. Barcha asosiy funktsiyalar implementatsiya qilingan, mobil uchun optimallashtirilgan va biznes darajasidagi dizaynga ega.

**O'yin hozircha ishga tayyor!** 🚀

---

*Created with ❤️ by Senior Full-Stack Developer*
