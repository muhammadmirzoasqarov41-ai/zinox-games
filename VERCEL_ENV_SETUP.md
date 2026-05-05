# Vercel Environment Variables Setup Guide

## 🚀 Vercel Deploy Qilish Uchun Environment Variables

### 📋 Required Environment Variables

Vercel project settings ga quyidagi environment variables qo'shing:

#### 1. Supabase Credentials
```
NEXT_PUBLIC_SUPABASE_URL=https://btwrcgtrelecucwaruvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d3JjZ3RyZWxlY3Vjd2FydXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzQ5MDAsImV4cCI6MjA0ODg1MDkwMH0.2F0j9fLqzv5kK0xK2jTm3fO1lS7qJ8H9X2aYbW3Zc4
```

#### 2. Groq API Key (Optional - agar AI features kerak bo'lsa)
```
GROQ_API_KEY=your_groq_api_key_here
```

### 🛠️ Setup Qadamlari

#### 1. Vercel Project Yaratish
1. [Vercel.com](https://vercel.com) ga kiring
2. "New Project" tugmasini bosing
3. GitHub repository ni import qiling: `muhammadmirzoasqarov41-ai/zinox-games`
4. Framework: "Other" (Static HTML)
5. Build Command: `echo "No build needed"`
6. Output Directory: `.`

#### 2. Environment Variables Qo'shish
1. Project settings ga o'ting
2. "Environment Variables" section ga bosing
3. Quyidagi variables qo'shing:

**Variable Name:** `NEXT_PUBLIC_SUPABASE_URL`
**Value:** `https://btwrcgtrelecucwaruvl.supabase.co`
**Environment:** `Production`, `Preview`, `Development`

**Variable Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d3JjZ3RyZWxlY3Vjd2FydXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzQ5MDAsImV4cCI6MjA0ODg1MDkwMH0.2F0j9fLqzv5kK0xK2jTm3fO1lS7qJ8H9X2aYbW3Zc4`
**Environment:** `Production`, `Preview`, `Development`

#### 3. Deploy Qilish
1. "Deploy" tugmasini bosing
2. Vercel avtomatik deploy qiladi
3. Deploy tugaguniga o'ting

### 🔧 Code Updates (Environment Variables uchun)

Environment variables ishlatish uchun step6-chat.js ni yangilash kerak:

```javascript
// Supabase initialization
function initializeSupabase() {
    try {
        // Check if Supabase is available
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase not available, using localStorage');
            loadFromLocalStorage();
            return;
        }
        
        // Use environment variables or fallback
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btwrcgtrelecucwaruvl.supabase.co';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
        
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase initialized');
        
        // Load saved game state
        await loadGameState();
        
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
    }
}
```

### 📱 Deploy dan Keyin

1. **Test qiling**: Deploy qilingan saytni tekshiring
2. **Console loglar**: Environment variables to'g'ri yuklanganini tekshiring
3. **Supabase connection**: Database ulanishini tekshiring
4. **Mobile test**: Har qurilmada ishlashini tekshiring

### 🌐 Deploy URL

Deploy qilingandan so'ing:
- **Production URL**: `https://zinox-games.vercel.app`
- **Preview URLs**: Har har commit uchun avtomatik yaratiladi

### 🔍 Debug Qilish

Agar ishlamasa:
1. Vercel logs ni tekshiring
2. Environment variables to'g'ri yozilganligini tekshiring
3. Supabase connection ni tekshiring
4. Console errors ni tekshiring

### 🎯 Qo'shimcha Sozlamalar

#### Custom Domain (Optional)
1. Project settings → Domains
2. Custom domain qo'shing
3. DNS sozlamalarini yangilang

#### Analytics (Optional)
1. Vercel Analytics yoqing
2. Google Analytics qo'shing

---

### 📞 Yordam

Agar muammo bo'lsa:
1. Vercel documentation: https://vercel.com/docs
2. Supabase documentation: https://supabase.com/docs
3. GitHub issues: https://github.com/muhammadmirzoasqarov41-ai/zinox-games/issues

**🚀 Tayyor! Endi Vercel ga deploy qilishingiz mumkin!**
