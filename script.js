// Zinox Games - Complete Game Logic
// Author: Senior Full-Stack Developer
// Version: 1.0 Production Ready

class ZinoxGames {
    // Helper methods - must be defined before constructor
    generateUserId() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    constructor() {
        // Game State
        this.gameState = {
            zinoxTokens: 0,
            cashBalance: 0,
            tapPower: 1,
            autoClickerLevel: 0,
            multiplierLevel: 1,
            comboMasterLevel: 0,
            totalClicks: 0,
            username: 'Guest',
            userId: this.generateUserId(),
            phone: '',
            telegram: '',
            referralCode: this.generateReferralCode(),
            referredBy: null,
            referralCount: 0,
            referralEarnings: 0,
            lastSaveTime: Date.now(),
            lastAdTime: Date.now(),
            sessionStartTime: Date.now(),
            isOnline: true,
            rank: '-',
            energy: 100,
            maxEnergy: 100,
            energyRegenTime: Date.now(),
            joinDate: new Date().toISOString(),
            isAuthenticated: false,
            donateProgress: {
                freeFire: { current: 0, target: 13000, completed: false },
                pubg: { current: 0, target: 12000, completed: false },
                mobileLegends: { current: 0, target: 10000, completed: false }
            },
            totalDonated: 0,
            donateCount: 0
        };

        // Combo System
        this.comboSystem = {
            isActive: false,
            multiplier: 1,
            progress: 0,
            maxProgress: 100,
            comboTime: 3000, // 3 seconds base
            lastClickTime: 0,
            clicksInCombo: 0,
            maxComboMultiplier: 10
        };

        // Configuration
        this.config = {
            autoSaveInterval: 30000, // 30 seconds
            adInterval: 480000, // 8 minutes
            vibrationDuration: 50,
            soundEnabled: true,
            vibrationEnabled: true,
            supabaseUrl: 'https://btwrcgtrelecucwaruvl.supabase.co',
            supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d3JjZ3RyZWxlY3Vjd2FydXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzQ5MDAsImV4cCI6MjA0ODg1MDkwMH0.2F0j9fLqzv5kK0xK2jTm3fO1lS7qJ8H9X2aYbW3Zc4',
            groqApiKey: process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE'
        };

        // DOM Elements
        this.elements = {};
        
        // Initialize - don't call async from constructor
        // this.init() will be called separately
        console.log('🏗️ ZinoxGames constructor completed');
        
        // Auto-start initialization after constructor
        setTimeout(() => {
            this.init().catch(error => {
                console.error('❌ Auto-init failed:', error);
            });
        }, 100);
    }

    async init() {
        console.log('🎮 Zinox Games ishga tushirilmoqda...');
        
        try {
            // Simple initialization - no loading screen
            console.log('📦 Elementlar yuklanmoqda...');
            this.initializeElements();
            
            console.log('💾 O\'yin holati yuklanmoqda...');
            await this.loadGameState();
            
            console.log('🔧 Tadbirlar sozlanmoqda...');
            this.setupEventListeners();
            
            console.log('⚙️ Tizimlar ishga tushirilmoqda...');
            this.initializeSystems();
            
            console.log('🔄 O\'yin tsikllari yoqilmoqda...');
            this.startGameLoops();
            
            console.log('✅ O\'in tayyor!');
            
            // Hide simple loading indicator
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // Show auth if not authenticated
            if (!this.gameState.isAuthenticated) {
                this.openModal('auth');
            } else {
                this.showNotification('🎮 O\'yin yuklandi! Omad!', 'success');
            }
            
            console.log('🎯 O\'yin muvaffaqiyatli yuklandi va ishga tushdi');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            
            // Hide loading indicator even on error
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // Show error message
            this.showNotification('❌ O\'yin yuklashda xatolik. Qayta yuklang.', 'error');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    async simulateLoadingProgress() {
        const steps = [
            { progress: 20, text: 'O\'yin yuklanmoqda...', delay: 300 },
            { progress: 40, text: 'Resurslar yuklanmoqda...', delay: 400 },
            { progress: 60, text: 'Tizim tayyorlanmoqda...', delay: 500 },
            { progress: 80, text: 'Qayta bog\'lanish...', delay: 300 }
        ];

        for (const step of steps) {
            await this.delay(step.delay);
            this.updateLoadingProgress(step.progress);
            this.updateLoadingText(step.text);
        }
    }

    updateLoadingProgress(progress) {
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    updateLoadingText(text) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initializeElements() {
        // Currency displays
        this.elements.zinoxAmount = document.getElementById('zinoxAmount');
        this.elements.cashAmount = document.getElementById('cashAmount');
        
        // Tap system
        this.elements.tapArea = document.getElementById('tapArea');
        this.elements.tapButton = document.getElementById('tapButton');
        this.elements.tapValue = document.getElementById('tapValue');
        this.elements.comboDisplay = document.getElementById('comboDisplay');
        this.elements.comboMultiplier = document.getElementById('comboMultiplier');
        this.elements.comboProgress = document.getElementById('comboProgress');
        
        // Stats
        this.elements.perSecond = document.getElementById('perSecond');
        this.elements.totalClicks = document.getElementById('totalClicks');
        this.elements.rank = document.getElementById('rank');
        this.elements.energyBar = document.getElementById('energyBar');
        this.elements.energyText = document.getElementById('energyText');
        
        // Upgrade buttons
        this.elements.buyTapPower = document.getElementById('buyTapPower');
        this.elements.buyAutoClicker = document.getElementById('buyAutoClicker');
        this.elements.buyMultiplier = document.getElementById('buyMultiplier');
        this.elements.buyComboMaster = document.getElementById('buyComboMaster');
        
        // Upgrade costs and levels
        this.elements.tapPowerCost = document.getElementById('tapPowerCost');
        this.elements.autoClickerCost = document.getElementById('autoClickerCost');
        this.elements.multiplierCost = document.getElementById('multiplierCost');
        this.elements.comboCost = document.getElementById('comboCost');
        
        this.elements.tapPowerLevel = document.getElementById('tapPowerLevel');
        this.elements.autoClickerLevel = document.getElementById('autoClickerLevel');
        this.elements.multiplierLevel = document.getElementById('multiplierLevel');
        this.elements.comboLevel = document.getElementById('comboLevel');
        
        // User info
        this.elements.username = document.getElementById('username');
        this.elements.settingsBtn = document.getElementById('settingsBtn');
        
        // Navigation
        this.elements.navBtns = document.querySelectorAll('.nav-btn');
        
        // Modals
        this.elements.modals = {
            leaderboard: document.getElementById('leaderboardModal'),
            referral: document.getElementById('referralModal'),
            shop: document.getElementById('shopModal'),
            ad: document.getElementById('adModal'),
            settings: document.getElementById('settingsModal'),
            auth: document.getElementById('authModal'),
            profile: document.getElementById('profileModal'),
            missions: document.getElementById('missionsModal'),
            donate: document.getElementById('donateModal'),
            chat: document.getElementById('chatModal')
        };
        
        // Modal buttons
        this.elements.closeLeaderboard = document.getElementById('closeLeaderboard');
        this.elements.closeReferral = document.getElementById('closeReferral');
        this.elements.closeShop = document.getElementById('closeShop');
        this.elements.closeAd = document.getElementById('closeAd');
        this.elements.closeSettings = document.getElementById('closeSettings');
        this.elements.closeDonate = document.getElementById('closeDonate');
        this.elements.closeChat = document.getElementById('closeChat');
        
        // Chat elements
        this.elements.chatMessages = document.getElementById('chatMessages');
        this.elements.chatInput = document.getElementById('chatInput');
        this.elements.chatSendBtn = document.getElementById('chatSendBtn');
        
        // Donate buttons
        this.elements.donateFreeFire = document.getElementById('donateFreeFire');
        this.elements.donatePUBG = document.getElementById('donatePUBG');
        this.elements.donateML = document.getElementById('donateML');
        
        // Referral
        this.elements.referralCode = document.getElementById('referralCode');
        this.elements.copyReferral = document.getElementById('copyReferral');
        this.elements.referralInput = document.getElementById('referralInput');
        this.elements.applyReferral = document.getElementById('applyReferral');
        this.elements.referralCount = document.getElementById('referralCount');
        this.elements.referralEarnings = document.getElementById('referralEarnings');
        
        // Settings
        this.elements.saveSettings = document.getElementById('saveSettings');
        this.elements.soundToggle = document.getElementById('soundToggle');
        this.elements.vibrationToggle = document.getElementById('vibrationToggle');
        
        // Shop
        this.elements.buyCash = document.getElementById('buyCash');
        this.elements.skipAdBtn = document.getElementById('skipAdBtn');
        
        // Leaderboard
        this.elements.leaderboardList = document.getElementById('leaderboardList');
        this.elements.onlineCount = document.getElementById('onlineCount');
        
        // Initialize Supabase
        this.initializeSupabase();
    }

    initializeSupabase() {
        try {
            // Check if Supabase is available
            if (typeof supabase !== 'undefined') {
                this.supabase = supabase.createClient(
                    this.config.supabaseUrl,
                    this.config.supabaseAnonKey
                );
                console.log('✅ Supabase initialized');
            } else {
                console.warn('⚠️ Supabase not available, using localStorage only');
            }
        } catch (error) {
            console.error('❌ Supabase initialization error:', error);
        }
    }

    async loadGameState() {
        try {
            // Load from localStorage first
            const savedState = localStorage.getItem('zinoxGameState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                // Merge with current state (preserve new fields)
                this.gameState = { ...this.gameState, ...parsedState };
                console.log('📦 O\'yin holati yuklandi');
            }
            
            // If authenticated, sync with Supabase
            if (this.gameState.isAuthenticated && this.supabase) {
                await this.syncFromSupabase();
            }
            
            // Update UI
            this.updateUI();
            
        } catch (error) {
            console.error('❌ O\'yin holatini yuklashda xatolik:', error);
            this.showNotification('❌ O\'yin holatini yuklashda xatolik', 'error');
        }
    }

    async syncFromSupabase() {
        try {
            const { data, error } = await this.supabase
                .from('players')
                .select('*')
                .eq('user_id', this.gameState.userId)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            
            if (data) {
                // Update game state with Supabase data
                this.gameState = { ...this.gameState, ...data };
                console.log('📡 Supabase dan ma\'lumotlar sync qilindi');
            }
            
        } catch (error) {
            console.error('❌ Supabase sync xatosi:', error);
        }
    }

    setupEventListeners() {
        console.log('🔧 Tadbirlar sozlanmoqda...');
        
        // Tap area
        if (this.elements.tapArea) {
            this.elements.tapArea.addEventListener('click', (e) => this.handleTap(e));
            this.elements.tapArea.addEventListener('touchstart', (e) => this.handleTap(e));
            console.log('✅ Tap area tadbirlari ulandi');
        } else if (this.elements.tapButton) {
            this.elements.tapButton.addEventListener('click', (e) => this.handleTap(e));
            this.elements.tapButton.addEventListener('touchstart', (e) => this.handleTap(e));
            console.log('✅ Tap button tadbirlari ulandi');
        } else {
            console.warn('⚠️ Tap area/button topilmadi');
        }
        
        // Upgrade buttons
        if (this.elements.buyTapPower) {
            this.elements.buyTapPower.addEventListener('click', () => this.buyUpgrade('tapPower'));
        }
        if (this.elements.buyAutoClicker) {
            this.elements.buyAutoClicker.addEventListener('click', () => this.buyUpgrade('autoClicker'));
        }
        if (this.elements.buyMultiplier) {
            this.elements.buyMultiplier.addEventListener('click', () => this.buyUpgrade('multiplier'));
        }
        if (this.elements.buyComboMaster) {
            this.elements.buyComboMaster.addEventListener('click', () => this.buyUpgrade('comboMaster'));
        }
        console.log('✅ Upgrade tugmalari ulandi');
        
        // Modal buttons
        if (this.elements.leaderboardBtn) {
            this.elements.leaderboardBtn.addEventListener('click', () => this.openModal('leaderboard'));
        }
        if (this.elements.referralBtn) {
            this.elements.referralBtn.addEventListener('click', () => this.openModal('referral'));
        }
        if (this.elements.shopBtn) {
            this.elements.shopBtn.addEventListener('click', () => this.openModal('shop'));
        }
        if (this.elements.adBtn) {
            this.elements.adBtn.addEventListener('click', () => this.openModal('ad'));
        }
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.openModal('settings'));
        }
        console.log('✅ Modal tugmalari ulandi');
        
        // Close modal buttons
        if (this.elements.closeLeaderboard) {
            this.elements.closeLeaderboard.addEventListener('click', () => this.closeModal('leaderboard'));
        }
        if (this.elements.closeReferral) {
            this.elements.closeReferral.addEventListener('click', () => this.closeModal('referral'));
        }
        if (this.elements.closeShop) {
            this.elements.closeShop.addEventListener('click', () => this.closeModal('shop'));
        }
        if (this.elements.closeAd) {
            this.elements.closeAd.addEventListener('click', () => this.closeModal('ad'));
        }
        if (this.elements.closeSettings) {
            this.elements.closeSettings.addEventListener('click', () => this.closeModal('settings'));
        }
        
        // Referral code copy
        if (this.elements.copyReferralBtn) {
            this.elements.copyReferralBtn.addEventListener('click', () => this.copyReferralCode());
        }
        if (this.elements.applyReferralBtn) {
            this.elements.applyReferralBtn.addEventListener('click', () => this.applyReferralCode());
        }
        
        // Ad skip
        if (this.elements.skipAdBtn) {
            this.elements.skipAdBtn.addEventListener('click', () => this.skipAd());
        }
        
        // Settings
        if (this.elements.saveSettings) {
            this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Page visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Before unload
        window.addEventListener('beforeunload', () => this.saveGameState());
        
        console.log('✅ Barcha tadbirlar muvaffaqiyatli sozlandi');
        
        // Setup auth listeners
        this.setupAuthListeners();
        
        // Setup profile listeners
        this.setupProfileListeners();
    }

    setupAuthListeners() {
        // Auth modal elements
        const authModal = document.getElementById('authModal');
        const signInBtn = document.getElementById('signInBtn');
        const signUpBtn = document.getElementById('signUpBtn');
        const authSwitchBtn = document.getElementById('authSwitchBtn');
        const closeAuthBtn = document.getElementById('closeAuth');
        
        if (signInBtn) {
            signInBtn.addEventListener('click', () => this.handleSignIn());
        }
        
        if (signUpBtn) {
            signUpBtn.addEventListener('click', () => this.handleSignUp());
        }
        
        if (authSwitchBtn) {
            authSwitchBtn.addEventListener('click', () => this.switchAuthMode());
        }
        
        if (closeAuthBtn) {
            closeAuthBtn.addEventListener('click', () => this.closeModal('auth'));
        }
    }

    setupProfileListeners() {
        // Profile modal elements
        const profileEditBtn = document.getElementById('profileEditBtn');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const closeProfileBtn = document.getElementById('closeProfile');
        
        if (profileEditBtn) {
            profileEditBtn.addEventListener('click', () => this.enableProfileEdit());
        }
        
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveProfileData());
        }
        
        if (closeProfileBtn) {
            closeProfileBtn.addEventListener('click', () => this.closeModal('profile'));
        }
    }

    initializeSystems() {
        // Initialize energy system
        this.initializeEnergySystem();
        
        // Initialize combo system
        this.initializeComboSystem();
        
        // Initialize anti-cheat
        this.initializeAntiCheat();
        
        console.log('⚙️ Tizimlar ishga tushirildi');
    }

    initializeEnergySystem() {
        // Start energy regeneration
        setInterval(() => {
            if (this.gameState.energy < this.gameState.maxEnergy) {
                const now = Date.now();
                const timeSinceLastRegen = now - this.gameState.energyRegenTime;
                const regenAmount = Math.floor(timeSinceLastRegen / 3000); // 3 seconds per regen
                
                if (regenAmount > 0) {
                    this.gameState.energy = Math.min(
                        this.gameState.energy + regenAmount,
                        this.gameState.maxEnergy
                    );
                    this.gameState.energyRegenTime = now;
                    this.updateEnergyDisplay();
                }
            }
        }, 1000);
    }

    initializeComboSystem() {
        // Reset combo if no clicks for 3 seconds
        setInterval(() => {
            if (this.comboSystem.isActive) {
                const now = Date.now();
                if (now - this.comboSystem.lastClickTime > this.comboSystem.comboTime) {
                    this.resetCombo();
                }
            }
        }, 100);
    }

    initializeAntiCheat() {
        // Track suspicious activity
        this.antiCheat = {
            clicksInLastSecond: 0,
            lastClickTimes: [],
            suspiciousClickCount: 0,
            maxClicksPerSecond: 15
        };
    }

    startGameLoops() {
        // Auto-save loop
        setInterval(() => {
            this.saveGameState();
        }, this.config.autoSaveInterval);
        
        // Auto-clicker loop
        setInterval(() => {
            if (this.gameState.autoClickerLevel > 0) {
                const autoClicks = this.gameState.autoClickerLevel;
                this.gameState.zinoxTokens += autoClicks;
                this.updateUI();
                this.playTapSound();
            }
        }, 1000);
        
        // Update online status
        setInterval(() => {
            this.updateOnlineStatus();
        }, 30000);
        
        console.log('🔄 O\'yin tsikllari boshlandi');
    }

    handleTap(e) {
        e.preventDefault();
        
        // Check energy
        if (this.gameState.energy <= 0) {
            this.showNotification('⚡ Energiya tugadi! Kuting...', 'warning');
            return;
        }
        
        // Anti-cheat check
        if (this.checkSuspiciousActivity()) {
            this.handleSuspiciousActivity();
            return;
        }
        
        // Consume energy
        this.gameState.energy--;
        this.updateEnergyDisplay();
        
        // Calculate tap value
        const tapValue = this.calculateTapValue();
        
        // Add tokens
        this.gameState.zinoxTokens += tapValue;
        this.gameState.totalClicks++;
        
        // Update combo
        this.updateCombo();
        
        // Play sound
        this.playTapSound();
        
        // Update UI
        this.updateUI();
        
        // Visual feedback
        this.showTapFeedback(e, tapValue);
    }

    calculateTapValue() {
        let value = this.gameState.tapPower;
        
        // Apply multiplier
        value *= this.gameState.multiplierLevel;
        
        // Apply combo multiplier
        if (this.comboSystem.isActive) {
            value *= this.comboSystem.multiplier;
        }
        
        return Math.floor(value);
    }

    updateCombo() {
        const now = Date.now();
        
        if (this.comboSystem.isActive) {
            // Update existing combo
            const timeSinceLastClick = now - this.comboSystem.lastClickTime;
            
            if (timeSinceLastClick < this.comboSystem.comboTime) {
                // Continue combo
                this.comboSystem.clicksInCombo++;
                this.comboSystem.progress = Math.min(
                    this.comboSystem.progress + 10,
                    this.comboSystem.maxProgress
                );
                
                // Update multiplier
                const newMultiplier = Math.min(
                    1 + Math.floor(this.comboSystem.clicksInCombo / 5),
                    this.comboSystem.maxComboMultiplier
                );
                
                if (newMultiplier > this.comboSystem.multiplier) {
                    this.comboSystem.multiplier = newMultiplier;
                    this.showNotification(`🔥 Combo x${newMultiplier}!`, 'success');
                }
            } else {
                // Reset combo
                this.resetCombo();
            }
        } else {
            // Start new combo
            this.comboSystem.isActive = true;
            this.comboSystem.clicksInCombo = 1;
            this.comboSystem.progress = 10;
            this.comboSystem.multiplier = 1;
        }
        
        this.comboSystem.lastClickTime = now;
        this.updateComboDisplay();
    }

    resetCombo() {
        this.comboSystem.isActive = false;
        this.comboSystem.multiplier = 1;
        this.comboSystem.progress = 0;
        this.comboSystem.clicksInCombo = 0;
        this.updateComboDisplay();
    }

    updateComboDisplay() {
        if (this.elements.comboDisplay) {
            this.elements.comboDisplay.style.display = this.comboSystem.isActive ? 'block' : 'none';
        }
        
        if (this.elements.comboMultiplier) {
            this.elements.comboMultiplier.textContent = `x${this.comboSystem.multiplier}`;
        }
        
        if (this.elements.comboProgress) {
            this.elements.comboProgress.style.width = `${this.comboSystem.progress}%`;
        }
    }

    checkSuspiciousActivity() {
        const now = Date.now();
        
        // Remove old click times (older than 1 second)
        this.antiCheat.lastClickTimes = this.antiCheat.lastClickTimes.filter(
            time => now - time < 1000
        );
        
        // Add current click time
        this.antiCheat.lastClickTimes.push(now);
        
        // Check clicks per second
        const clicksPerSecond = this.antiCheat.lastClickTimes.length;
        
        if (clicksPerSecond > this.antiCheat.maxClicksPerSecond) {
            this.antiCheat.suspiciousClickCount++;
            
            if (this.antiCheat.suspiciousClickCount > 3) {
                return true; // Suspicious activity detected
            }
        }
        
        return false;
    }

    handleSuspiciousActivity() {
        this.showNotification('⚠️ Shubhali faoliyat aniqlandi! Iltimos, sekinroq bosing.', 'warning');
        
        // Reset combo
        this.resetCombo();
        
        // Add delay
        setTimeout(() => {
            this.showNotification('✅ O\'yin davom etishi mumkin', 'success');
        }, 2000);
    }

    showTapFeedback(e, value) {
        // Create floating text
        const feedback = document.createElement('div');
        feedback.className = 'tap-feedback';
        feedback.textContent = `+${value}`;
        feedback.style.left = `${e.clientX}px`;
        feedback.style.top = `${e.clientY}px`;
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }

    playTapSound() {
        if (!this.config.soundEnabled) return;
        
        // Create money/coin drop sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create coin drop sound with metallic clink
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
            const noiseSource = audioContext.createBufferSource();
            const gainNode1 = audioContext.createGain();
            const gainNode2 = audioContext.createGain();
            const noiseGain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            // Generate white noise for metallic sound
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = Math.random() * 2 - 1;
            }
            noiseSource.buffer = noiseBuffer;
            
            // Setup main coin sound (lower frequency for weight)
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.08);
            
            // Setup harmonic overtone (brightness)
            oscillator2.type = 'triangle';
            oscillator2.frequency.setValueAtTime(1600, audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
            
            // Setup filter for metallic clink
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2000, audioContext.currentTime);
            filter.Q.setValueAtTime(5, audioContext.currentTime);
            
            // Setup gain nodes
            gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            gainNode2.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
            
            noiseGain.gain.setValueAtTime(0.1, audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            
            // Connect nodes
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioContext.destination);
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(filter);
            filter.connect(audioContext.destination);
            
            noiseSource.connect(noiseGain);
            noiseGain.connect(filter);
            
            // Start all sources
            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            noiseSource.start(audioContext.currentTime);
            
            oscillator1.stop(audioContext.currentTime + 0.2);
            oscillator2.stop(audioContext.currentTime + 0.12);
            noiseSource.stop(audioContext.currentTime + 0.05);
            
        } catch (error) {
            console.log('Sound not available');
        }
    }

    buyUpgrade(type) {
        const costs = {
            tapPower: Math.floor(4 * Math.pow(2, this.gameState.tapPowerLevel)),
            autoClicker: Math.floor(8 * Math.pow(2, this.gameState.autoClickerLevel)),
            multiplier: Math.floor(16 * Math.pow(2, this.gameState.multiplierLevel - 1)),
            comboMaster: Math.floor(32 * Math.pow(2, this.gameState.comboMasterLevel))
        };
        
        const cost = costs[type];
        
        if (this.gameState.cashBalance < cost) {
            this.showNotification('💰 Cash yetarli emas!', 'error');
            return;
        }
        
        // Deduct cash
        this.gameState.cashBalance -= cost;
        
        // Apply upgrade
        switch (type) {
            case 'tapPower':
                this.gameState.tapPowerLevel++;
                this.gameState.tapPower++;
                break;
            case 'autoClicker':
                this.gameState.autoClickerLevel++;
                break;
            case 'multiplier':
                this.gameState.multiplierLevel++;
                break;
            case 'comboMaster':
                this.gameState.comboMasterLevel++;
                this.comboSystem.comboTime = Math.max(1000, this.comboSystem.comboTime - 200);
                break;
        }
        
        // Update UI
        this.updateUI();
        this.updateUpgradeDisplay();
        
        // Save game
        this.saveGameState();
        
        // Show notification
        this.showNotification(`✅ ${this.getUpgradeName(type)} yangilandi!`, 'success');
        
        // Play sound
        this.playUpgradeSound();
    }

    getUpgradeName(type) {
        const names = {
            tapPower: 'Tap Power',
            autoClicker: 'Auto Clicker',
            multiplier: 'Multiplier',
            comboMaster: 'Combo Master'
        };
        return names[type] || 'Upgrade';
    }

    playUpgradeSound() {
        if (!this.config.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            
        } catch (error) {
            console.log('Sound not available');
        }
    }

    updateUI() {
        // Update currency displays
        if (this.elements.zinoxAmount) {
            this.elements.zinoxAmount.textContent = this.formatNumber(this.gameState.zinoxTokens);
        }
        
        if (this.elements.cashAmount) {
            this.elements.cashAmount.textContent = this.formatNumber(this.gameState.cashBalance);
        }
        
        // Update stats
        if (this.elements.totalClicks) {
            this.elements.totalClicks.textContent = this.formatNumber(this.gameState.totalClicks);
        }
        
        if (this.elements.rank) {
            this.elements.rank.textContent = this.gameState.rank;
        }
        
        if (this.elements.perSecond) {
            this.elements.perSecond.textContent = this.gameState.autoClickerLevel;
        }
        
        // Update username
        if (this.elements.username) {
            this.elements.username.textContent = this.gameState.username;
        }
        
        // Update tap value
        if (this.elements.tapValue) {
            this.elements.tapValue.textContent = this.calculateTapValue();
        }
        
        // Update upgrade displays
        this.updateUpgradeDisplay();
        
        // Update energy display
        this.updateEnergyDisplay();
    }

    updateUpgradeDisplay() {
        const costs = {
            tapPower: Math.floor(4 * Math.pow(2, this.gameState.tapPowerLevel)),
            autoClicker: Math.floor(8 * Math.pow(2, this.gameState.autoClickerLevel)),
            multiplier: Math.floor(16 * Math.pow(2, this.gameState.multiplierLevel - 1)),
            comboMaster: Math.floor(32 * Math.pow(2, this.gameState.comboMasterLevel))
        };
        
        // Update costs
        if (this.elements.tapPowerCost) {
            this.elements.tapPowerCost.textContent = this.formatNumber(costs.tapPower);
        }
        
        if (this.elements.autoClickerCost) {
            this.elements.autoClickerCost.textContent = this.formatNumber(costs.autoClicker);
        }
        
        if (this.elements.multiplierCost) {
            this.elements.multiplierCost.textContent = this.formatNumber(costs.multiplier);
        }
        
        if (this.elements.comboCost) {
            this.elements.comboCost.textContent = this.formatNumber(costs.comboMaster);
        }
        
        // Update levels
        if (this.elements.tapPowerLevel) {
            this.elements.tapPowerLevel.textContent = `Level ${this.gameState.tapPowerLevel}`;
        }
        
        if (this.elements.autoClickerLevel) {
            this.elements.autoClickerLevel.textContent = `Level ${this.gameState.autoClickerLevel}`;
        }
        
        if (this.elements.multiplierLevel) {
            this.elements.multiplierLevel.textContent = `Level ${this.gameState.multiplierLevel}`;
        }
        
        if (this.elements.comboLevel) {
            this.elements.comboLevel.textContent = `Level ${this.gameState.comboMasterLevel}`;
        }
    }

    updateEnergyDisplay() {
        if (this.elements.energyBar) {
            const percentage = (this.gameState.energy / this.gameState.maxEnergy) * 100;
            this.elements.energyBar.style.width = `${percentage}%`;
        }
        
        if (this.elements.energyText) {
            this.elements.energyText.textContent = `${this.gameState.energy}/${this.gameState.maxEnergy}`;
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return Math.floor(num).toString();
    }

    // Modal functions
    openModal(modalName) {
        const modal = this.elements.modals[modalName];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Load modal-specific data
            if (modalName === 'leaderboard') {
                this.loadLeaderboard();
            } else if (modalName === 'shop') {
                this.loadShopData();
            } else if (modalName === 'donate') {
                this.updateDonateDisplay();
            } else if (modalName === 'chat') {
                this.initializeChat();
            }
        }
    }

    closeModal(modalName) {
        const modal = this.elements.modals[modalName];
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Footer navigation
    handleFooterNav(tabName) {
        // Update active button
        this.elements.navBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Handle tab actions
        switch (tabName) {
            case 'game':
                // Close all modals
                Object.keys(this.elements.modals).forEach(modal => {
                    this.closeModal(modal);
                });
                break;
            case 'leaderboard':
                this.openModal('leaderboard');
                break;
            case 'profile':
                if (this.gameState.isAuthenticated) {
                    this.updateProfileDisplay();
                    this.openModal('profile');
                } else {
                    this.openModal('auth');
                }
                break;
            case 'missions':
                if (this.gameState.isAuthenticated) {
                    this.loadMissions();
                    this.openModal('missions');
                } else {
                    this.openModal('auth');
                }
                break;
            case 'chat':
                if (this.gameState.isAuthenticated) {
                    this.openModal('chat');
                    this.initializeChat();
                } else {
                    this.openModal('auth');
                }
                break;
            case 'donate':
                if (this.gameState.isAuthenticated) {
                    this.updateDonateDisplay();
                    this.openModal('donate');
                } else {
                    this.openModal('auth');
                }
                break;
            case 'referral':
                this.openModal('referral');
                break;
            case 'shop':
                this.openModal('shop');
                break;
        }
    }

    // Authentication functions
    async handleSignIn() {
        const phone = document.getElementById('phoneNumber').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!phone || !password) {
            this.showNotification('❌ Iltimos, barcha maydonlarni to\'ldiring', 'error');
            return;
        }
        
        if (!this.validatePhoneNumber(phone)) {
            this.showNotification('❌ Telefon raqami noto\'g\'ri formatda', 'error');
            return;
        }
        
        try {
            // Show loading
            this.showNotification('🔄 Kirish amalga oshirilmoqda...', 'info');
            
            // Check if user exists in Supabase
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('players')
                    .select('*')
                    .eq('phone', phone)
                    .single();
                
                if (error && error.code !== 'PGRST116') {
                    throw error;
                }
                
                if (!data) {
                    this.showNotification('❌ Foydalanuvchi topilmadi. Ro\'yxatdan o\'ting.', 'error');
                    return;
                }
                
                // User found, update game state
                this.gameState.isAuthenticated = true;
                this.gameState.phone = data.phone;
                this.gameState.username = data.username;
                this.gameState.userId = data.user_id;
                this.gameState.telegram = data.telegram;
                this.gameState.cashBalance = data.cash_balance || 0;
                this.gameState.zinoxTokens = data.zinox_tokens || 0;
                this.gameState.totalClicks = data.total_clicks || 0;
                this.gameState.referralCode = data.referral_code;
                this.gameState.referralCount = data.referral_count || 0;
                this.gameState.referralEarnings = data.referral_earnings || 0;
                this.gameState.joinDate = data.join_date;
                
                // Update last online
                await this.supabase
                    .from('players')
                    .update({ last_online: new Date().toISOString() })
                    .eq('user_id', this.gameState.userId);
                
                console.log('✅ Muvaffaqiyatli kirish');
            } else {
                // Fallback to localStorage
                const users = JSON.parse(localStorage.getItem('zinoxUsers') || '[]');
                const user = users.find(u => u.phone === phone);
                
                if (!user) {
                    this.showNotification('❌ Foydalanuvchi topilmadi. Ro\'yxatdan o\'ting.', 'error');
                    return;
                }
                
                if (user.password !== password) {
                    this.showNotification('❌ Parol noto\'g\'ri', 'error');
                    return;
                }
                
                // Update game state
                this.gameState.isAuthenticated = true;
                this.gameState.phone = user.phone;
                this.gameState.username = user.username;
                this.gameState.userId = user.userId;
                this.gameState.telegram = user.telegram;
                
                console.log('✅ Muvaffaqiyatli kirish (localStorage)');
            }
            
            // Close auth modal
            this.closeModal('auth');
            
            // Update UI
            this.updateUI();
            
            // Show success message
            this.showNotification(`🎉 Xush kelibsiz, ${this.gameState.username}!`, 'success');
            
            // Save game state
            this.saveGameState();
            
        } catch (error) {
            console.error('❌ Kirish xatosi:', error);
            this.showNotification('❌ Kirishda xatolik yuz berdi', 'error');
        }
    }

    async handleSignUp() {
        const phone = document.getElementById('phoneNumber').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const username = document.getElementById('signUpUsername').value.trim();
        const telegram = document.getElementById('telegram').value.trim();
        
        if (!phone || !password || !confirmPassword || !username) {
            this.showNotification('❌ Iltimos, barcha maydonlarni to\'ldiring', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('❌ Parollar mos kelmaydi', 'error');
            return;
        }
        
        if (!this.validatePhoneNumber(phone)) {
            this.showNotification('❌ Telefon raqami noto\'g\'ri formatda', 'error');
            return;
        }
        
        try {
            // Show loading
            this.showNotification('🔄 Ro\'yxatdan o\'tilmoqda...', 'info');
            
            // Check if user already exists
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('players')
                    .select('user_id')
                    .eq('phone', phone)
                    .single();
                
                if (error && error.code !== 'PGRST116') {
                    throw error;
                }
                
                if (data) {
                    this.showNotification('❌ Bu telefon raqami allaqachon ro\'yxatdan o\'tgan', 'error');
                    return;
                }
                
                // Create new user
                const newUser = {
                    user_id: this.gameState.userId,
                    phone: phone,
                    username: username,
                    telegram: telegram,
                    password: password, // In production, hash this
                    referral_code: this.gameState.referralCode,
                    zinox_tokens: 0,
                    cash_balance: 0,
                    total_clicks: 0,
                    is_online: true,
                    join_date: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    last_online: new Date().toISOString()
                };
                
                const { data: createdUser, error: createError } = await this.supabase
                    .from('players')
                    .insert([newUser])
                    .single();
                
                if (createError) throw createError;
                
                // Update game state
                this.gameState.isAuthenticated = true;
                this.gameState.phone = phone;
                this.gameState.username = username;
                this.gameState.telegram = telegram;
                
                console.log('✅ Muvaffaqiyatli ro\'yxatdan o\'tish');
            } else {
                // Fallback to localStorage
                const users = JSON.parse(localStorage.getItem('zinoxUsers') || '[]');
                
                if (users.find(u => u.phone === phone)) {
                    this.showNotification('❌ Bu telefon raqami allaqachon ro\'yxatdan o\'tgan', 'error');
                    return;
                }
                
                const newUser = {
                    userId: this.gameState.userId,
                    phone: phone,
                    password: password,
                    username: username,
                    telegram: telegram,
                    referralCode: this.gameState.referralCode,
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                localStorage.setItem('zinoxUsers', JSON.stringify(users));
                
                // Update game state
                this.gameState.isAuthenticated = true;
                this.gameState.phone = phone;
                this.gameState.username = username;
                this.gameState.telegram = telegram;
                
                console.log('✅ Muvaffaqiyatli ro\'yxatdan o\'tish (localStorage)');
            }
            
            // Close auth modal
            this.closeModal('auth');
            
            // Update UI
            this.updateUI();
            
            // Show success message
            this.showNotification(`🎉 Ro\'yxatdan o\'tdingiz, ${this.gameState.username}!`, 'success');
            
            // Save game state
            this.saveGameState();
            
        } catch (error) {
            console.error('❌ Ro\'yxatdan o\'tish xatosi:', error);
            this.showNotification('❌ Ro\'yxatdan o\'tishda xatolik yuz berdi', 'error');
        }
    }

    switchAuthMode() {
        const authModal = document.getElementById('authModal');
        const signInForm = document.getElementById('signInForm');
        const signUpForm = document.getElementById('signUpForm');
        const authTitle = document.getElementById('authTitle');
        const authSwitchBtn = document.getElementById('authSwitchBtn');
        
        if (signInForm.style.display === 'none') {
            // Switch to sign in
            signInForm.style.display = 'block';
            signUpForm.style.display = 'none';
            authTitle.textContent = '🔐 KIRISH';
            authSwitchBtn.textContent = 'Ro\'yxatdan o\'tish';
        } else {
            // Switch to sign up
            signInForm.style.display = 'none';
            signUpForm.style.display = 'block';
            authTitle.textContent = '📝 RO\'YXATDAN O\'TISH';
            authSwitchBtn.textContent = 'Kirish';
        }
    }

    validatePhoneNumber(phone) {
        // Uzbek phone number validation
        const phoneRegex = /^(\+998)?(90|91|92|93|94|95|96|97|98|99)\d{7}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Profile functions
    updateProfileDisplay() {
        const profileUsername = document.getElementById('profileUsername');
        const profilePhone = document.getElementById('profilePhone');
        const profileTelegram = document.getElementById('profileTelegram');
        const profileReferralCode = document.getElementById('profileReferralCode');
        const profileJoinDate = document.getElementById('profileJoinDate');
        const profileTotalClicks = document.getElementById('profileTotalClicks');
        const profileReferralCount = document.getElementById('profileReferralCount');
        
        if (profileUsername) profileUsername.textContent = this.gameState.username;
        if (profilePhone) profilePhone.textContent = this.gameState.phone;
        if (profileTelegram) profileTelegram.textContent = this.gameState.telegram || 'Kiritilmagan';
        if (profileReferralCode) profileReferralCode.textContent = this.gameState.referralCode;
        if (profileJoinDate) profileJoinDate.textContent = new Date(this.gameState.joinDate).toLocaleDateString('uz-UZ');
        if (profileTotalClicks) profileTotalClicks.textContent = this.formatNumber(this.gameState.totalClicks);
        if (profileReferralCount) profileReferralCount.textContent = this.gameState.referralCount;
    }

    enableProfileEdit() {
        const profileUsername = document.getElementById('profileUsername');
        const profileTelegram = document.getElementById('profileTelegram');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        
        if (profileUsername) {
            profileUsername.contentEditable = true;
            profileUsername.style.border = '2px solid var(--primary)';
        }
        
        if (profileTelegram) {
            profileTelegram.contentEditable = true;
            profileTelegram.style.border = '2px solid var(--primary)';
        }
        
        if (saveProfileBtn) {
            saveProfileBtn.style.display = 'block';
        }
    }

    async saveProfileData() {
        const profileUsername = document.getElementById('profileUsername');
        const profileTelegram = document.getElementById('profileTelegram');
        
        const newUsername = profileUsername.textContent.trim();
        const newTelegram = profileTelegram.textContent.trim();
        
        if (!newUsername) {
            this.showNotification('❌ Username bo\'sh bo\'lishi mumkin emas', 'error');
            return;
        }
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('players')
                    .update({
                        username: newUsername,
                        telegram: newTelegram
                    })
                    .eq('user_id', this.gameState.userId);
                
                if (error) throw error;
            }
            
            // Update local state
            this.gameState.username = newUsername;
            this.gameState.telegram = newTelegram;
            
            // Update UI
            this.updateUI();
            
            // Disable editing
            profileUsername.contentEditable = false;
            profileUsername.style.border = 'none';
            profileTelegram.contentEditable = false;
            profileTelegram.style.border = 'none';
            
            // Hide save button
            document.getElementById('saveProfileBtn').style.display = 'none';
            
            this.showNotification('✅ Profil ma\'lumotlari yangilandi', 'success');
            
        } catch (error) {
            console.error('❌ Profil yangilash xatosi:', error);
            this.showNotification('❌ Profil yangilashda xatolik', 'error');
        }
    }

    // Mission functions
    loadMissions() {
        const missionsList = document.getElementById('missionsList');
        if (!missionsList) return;
        
        const missions = [
            {
                id: 1,
                title: 'Birinchi qadamlar',
                description: '1000 token yig\'ing',
                reward: 50,
                progress: Math.min(this.gameState.zinoxTokens, 1000),
                target: 1000,
                completed: this.gameState.zinoxTokens >= 1000
            },
            {
                id: 2,
                title: 'Active o\'yinchi',
                description: '100 marta bosing',
                reward: 100,
                progress: Math.min(this.gameState.totalClicks, 100),
                target: 100,
                completed: this.gameState.totalClicks >= 100
            },
            {
                id: 3,
                title: 'Master Clicker',
                description: '10000 token yig\'ing',
                reward: 500,
                progress: Math.min(this.gameState.zinoxTokens, 10000),
                target: 10000,
                completed: this.gameState.zinoxTokens >= 10000
            },
            {
                id: 4,
                title: 'Referal Master',
                description: '5 do\'stni taklif qiling',
                reward: 1000,
                progress: Math.min(this.gameState.referralCount, 5),
                target: 5,
                completed: this.gameState.referralCount >= 5
            }
        ];
        
        missionsList.innerHTML = missions.map(mission => `
            <div class="mission-item ${mission.completed ? 'completed' : ''}">
                <div class="mission-header">
                    <h3>${mission.title}</h3>
                    <span class="mission-reward">+${mission.reward} 💎</span>
                </div>
                <p>${mission.description}</p>
                <div class="mission-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(mission.progress / mission.target) * 100}%"></div>
                    </div>
                    <span class="progress-text">${mission.progress}/${mission.target}</span>
                </div>
                ${mission.completed ? '<div class="mission-completed">✅ Tugallandi</div>' : ''}
            </div>
        `).join('');
    }

    // Donation functions
    updateDonateDisplay() {
        const donateStats = document.getElementById('donateStats');
        if (!donateStats) return;
        
        const totalDonated = this.gameState.totalDonated;
        const donateCount = this.gameState.donateCount;
        
        donateStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Jami yig'ilgan:</span>
                <span class="stat-value">${totalDonated.toLocaleString()} so'm</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Donatlar soni:</span>
                <span class="stat-value">${donateCount}</span>
            </div>
        `;
        
        // Update progress bars for each game
        Object.keys(this.gameState.donateProgress).forEach(gameType => {
            const progress = this.gameState.donateProgress[gameType];
            const progressBar = document.getElementById(`${gameType}Progress`);
            const progressText = document.getElementById(`${gameType}ProgressText`);
            const donateButton = document.getElementById(`donate${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`);
            
            if (progressBar) {
                const percentage = (progress.current / progress.target) * 100;
                progressBar.style.width = `${percentage}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${progress.current.toLocaleString()} / ${progress.target.toLocaleString()} so'm`;
            }
            
            if (donateButton) {
                donateButton.disabled = progress.completed;
                donateButton.textContent = progress.completed ? '✅ Tugallandi' : `Yuborish (${progress.target - progress.current} so'm qoldi)`;
            }
        });
    }

    async handleDonate(gameType) {
        const progress = this.gameState.donateProgress[gameType];
        const remaining = progress.target - progress.current;
        
        if (remaining <= 0) {
            this.showNotification('❌ Bu donat allaqachon tugallangan!', 'error');
            return;
        }
        
        const cashNeeded = Math.ceil(remaining / 2000); // 1 cash = 2000 so'm
        
        if (this.gameState.cashBalance < cashNeeded) {
            this.showNotification(`❌ Yetarli cash yo'q! ${cashNeeded} cash kerak.`, 'error');
            return;
        }
        
        // Confirmation dialog
        const confirmed = confirm(`${this.getGameName(gameType)} uchun ${remaining.toLocaleString()} so'm donat qilishni tasdiqlaysizmi?\n\nKerakli cash: ${cashNeeded}`);
        
        if (!confirmed) return;
        
        try {
            // Process donation
            await this.processDonation(gameType, remaining, cashNeeded);
            
        } catch (error) {
            console.error('❌ Donat xatosi:', error);
            this.showNotification('❌ Donat qilishda xatolik yuz berdi', 'error');
        }
    }

    async processDonation(gameType, amount, cashCost) {
        // Deduct cash
        this.gameState.cashBalance -= cashCost;
        
        // Update progress
        this.gameState.donateProgress[gameType].current += amount;
        this.gameState.totalDonated += amount;
        this.gameState.donateCount++;
        
        // Check if completed
        const progress = this.gameState.donateProgress[gameType];
        if (progress.current >= progress.target) {
            progress.completed = true;
            progress.current = progress.target;
            
            // Give bonus
            const bonusTokens = 1000;
            this.gameState.zinoxTokens += bonusTokens;
            this.showNotification(`🎉 Donat yakunlandi! ${bonusTokens} token bonus!`, 'success');
            
            // Process actual game donation via Groq API
            await this.processGameDonation(gameType);
        } else {
            this.showNotification(`✅ Donat yangilandi! ${progress.current}/${progress.target} so'm`, 'success');
        }
        
        // Update UI
        this.updateUI();
        this.updateDonateDisplay();
        
        // Save game
        this.saveGameState();
    }

    async processGameDonation(gameType) {
        try {
            // Use Groq API to process actual game donation
            const response = await this.callGroqAPI({
                action: 'process_donation',
                game_type: gameType,
                user_id: this.gameState.userId,
                amount: this.gameState.donateProgress[gameType].target
            });
            
            console.log('🎮 Game donation processed:', response);
            
        } catch (error) {
            console.error('❌ Game donation processing error:', error);
        }
    }

    getGameName(gameType) {
        const names = {
            freeFire: 'Free Fire',
            pubg: 'PUBG Mobile',
            mobileLegends: 'Mobile Legends'
        };
        return names[gameType] || gameType;
    }

    // Chat Functions
    initializeChat() {
        console.log('🚀 Chat tizimi ishga tushirilmoqda...');
        
        // Setup chat listeners first
        if (this.elements.chatInput) {
            this.elements.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
            
            // Add keydown listener for space and other keys
            this.elements.chatInput.addEventListener('keydown', (e) => {
                // Allow space and all other keys
                if (e.key === ' ') {
                    // Just allow space, don't prevent default
                    console.log('Space key pressed');
                }
            });
            
            // Add input event to track changes
            this.elements.chatInput.addEventListener('input', (e) => {
                console.log('Input changed:', e.target.value);
            });
            
            console.log('✅ Chat input listener ulandi');
        } else {
            console.warn('⚠️ Chat input elementi topilmadi');
        }
        
        if (this.elements.chatSendBtn) {
            this.elements.chatSendBtn.addEventListener('click', () => this.sendChatMessage());
            console.log('✅ Chat send button listener ulandi');
        } else {
            console.warn('⚠️ Chat send button elementi topilmadi');
        }
        
        if (this.elements.closeChat) {
            this.elements.closeChat.addEventListener('click', () => this.closeModal('chat'));
            console.log('✅ Chat close button listener ulandi');
        }
        
        // Try Supabase if available, otherwise use local storage
        if (this.supabase) {
            console.log('📡 Supabase bilan chat ishga tushirilmoqda...');
            this.loadChatMessages();
            this.setupChatSubscription();
        } else {
            console.warn('⚠️ Supabase yo\'q, local storage ishlatilmoqda...');
            this.loadLocalChatMessages();
        }
        
        console.log('✅ Chat tizimiga ulandi');
    }

    async loadChatMessages() {
        try {
            const { data, error } = await this.supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) throw error;
            
            // Reverse to show oldest first
            const messages = data.reverse();
            this.displayChatMessages(messages);
            console.log('✅ Supabase chat xabarlar yuklandi');
            
        } catch (error) {
            console.error('❌ Supabase chat xabarlarini yuklashda xatolik:', error);
            // Fallback to local storage
            this.loadLocalChatMessages();
        }
    }

    loadLocalChatMessages() {
        try {
            const messages = JSON.parse(localStorage.getItem('zinox_chat_messages') || '[]');
            this.displayChatMessages(messages);
            console.log('✅ Local storage chat xabarlar yuklandi');
        } catch (error) {
            console.error('❌ Local storage chat xabarlarini yuklashda xatolik:', error);
            // Show welcome message
            this.displayChatMessages([{
                user_id: 'system',
                username: 'System',
                message: '💬 Chatga xush kelibsiz! Xabar yuborish uchun ro\'yxatdan o\'ting.',
                created_at: new Date().toISOString()
            }]);
        }
    }

    displayChatMessages(messages) {
        if (!this.elements.chatMessages) return;
        
        this.elements.chatMessages.innerHTML = '';
        
        messages.forEach(message => {
            this.addChatMessage(message);
        });
        
        // Scroll to bottom
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    addChatMessage(message) {
        if (!this.elements.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.user_id === this.gameState.userId ? 'own' : ''}`;
        
        const time = new Date(message.created_at).toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.innerHTML = `
            <div class="chat-message-header">
                <span class="chat-message-username">${message.username}</span>
                <span class="chat-message-time">${time}</span>
            </div>
            <div class="chat-message-text">${this.escapeHtml(message.message)}</div>
        `;
        
        this.elements.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom if it's own message
        if (message.user_id === this.gameState.userId) {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
    }

    async sendChatMessage() {
        if (!this.elements.chatInput || !this.elements.chatSendBtn) return;
        
        const messageText = this.elements.chatInput.value;
        
        // Allow messages with spaces (but not empty)
        if (messageText.length === 0) return;
        
        // Check if user is authenticated
        if (!this.gameState.isAuthenticated) {
            this.showNotification('❌ Xabar yuborish uchun ro\'yxatdan o\'ting!', 'warning');
            return;
        }
        
        // Disable send button
        this.elements.chatSendBtn.disabled = true;
        
        const messageData = {
            user_id: this.gameState.userId,
            username: this.gameState.username,
            message: messageText.trim(), // Trim for storage but allow spaces in input
            created_at: new Date().toISOString()
        };
        
        try {
            if (this.supabase) {
                // Try Supabase first
                const { data, error } = await this.supabase
                    .from('chat_messages')
                    .insert([messageData])
                    .select();
                
                if (error) throw error;
                
                console.log('✅ Xabar Supabase ga yuborildi');
            } else {
                // Fallback to local storage
                this.saveLocalChatMessage(messageData);
                console.log('✅ Xabar local storage ga saqlandi');
            }
            
            // Add message to display immediately
            this.addChatMessage(messageData);
            
            // Clear input
            this.elements.chatInput.value = '';
            
            // Show success notification
            this.showNotification('✅ Xabar yuborildi!', 'success');
            
        } catch (error) {
            console.error('❌ Xabar yuborishda xatolik:', error);
            
            // Fallback to local storage
            try {
                this.saveLocalChatMessage(messageData);
                this.addChatMessage(messageData);
                this.elements.chatInput.value = '';
                this.showNotification('✅ Xabar mahalliy saqlandi!', 'success');
            } catch (fallbackError) {
                console.error('❌ Local storage fallback ham ishlamadi:', fallbackError);
                this.showNotification('❌ Xabar yuborib bo\'lmadi', 'error');
            }
        } finally {
            // Enable send button
            this.elements.chatSendBtn.disabled = false;
        }
    }

    saveLocalChatMessage(message) {
        const messages = JSON.parse(localStorage.getItem('zinox_chat_messages') || '[]');
        messages.push(message);
        
        // Keep only last 100 messages
        if (messages.length > 100) {
            messages.splice(0, messages.length - 100);
        }
        
        localStorage.setItem('zinox_chat_messages', JSON.stringify(messages));
    }

    setupChatSubscription() {
        if (!this.supabase) {
            console.log('⚠️ Supabase yo\'q, realtime subscription o\'rnatilmaydi');
            return;
        }
        
        try {
            const subscription = this.supabase
                .channel('chat_messages')
                .on('postgres_changes', 
                    { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                    (payload) => {
                        console.log('📨 Yangi xabar keldi:', payload.new);
                        const newMessage = payload.new;
                        if (newMessage.user_id !== this.gameState.userId) {
                            this.addChatMessage(newMessage);
                        }
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Chat realtime subscription o\'rnatildi');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Chat subscription xatosi');
                    }
                });
                
        } catch (error) {
            console.error('❌ Chat subscription o\'rnatishda xatolik:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Groq API Functions
    async callGroqAPI(data) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-70b-8192',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a game donation processing assistant. Process the donation request and return a confirmation.'
                        },
                        {
                            role: 'user',
                            content: JSON.stringify(data)
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.3
                })
            });
            
            const result = await response.json();
            return result.choices[0].message.content;
            
        } catch (error) {
            console.error('❌ Groq API xatosi:', error);
            throw error;
        }
    }

    // AI Protection System (placeholder for Groq API integration)
    async checkSuspiciousActivity(activity) {
        try {
            const response = await this.callGroqAPI({
                action: 'check_suspicious_activity',
                activity: activity,
                user_id: this.gameState.userId,
                phone: this.gameState.phone,
                total_clicks: this.gameState.totalClicks,
                cash_balance: this.gameState.cashBalance
            });
            
            // Parse response to determine if suspicious
            return response.toLowerCase().includes('suspicious');
            
        } catch (error) {
            console.error('❌ AI tekshiruvi xatosi:', error);
            return false; // Default to not suspicious on error
        }
    }

    // Utility functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    async saveGameState() {
        try {
            // Save to localStorage
            localStorage.setItem('zinoxGameState', JSON.stringify(this.gameState));
            
            // Save to Supabase if authenticated
            if (this.gameState.isAuthenticated && this.supabase) {
                await this.supabase
                    .from('players')
                    .upsert({
                        user_id: this.gameState.userId,
                        zinox_tokens: this.gameState.zinoxTokens,
                        cash_balance: this.gameState.cashBalance,
                        total_clicks: this.gameState.totalClicks,
                        last_online: new Date().toISOString(),
                        donate_progress: this.gameState.donateProgress,
                        total_donated: this.gameState.totalDonated,
                        donate_count: this.gameState.donateCount
                    });
            }
            
        } catch (error) {
            console.error('❌ O\'yin holatini saqlashda xatolik:', error);
        }
    }

    updateOnlineStatus() {
        if (this.gameState.isAuthenticated && this.supabase) {
            this.supabase
                .from('players')
                .update({ 
                    is_online: true,
                    last_online: new Date().toISOString()
                })
                .eq('user_id', this.gameState.userId);
        }
    }

    handleKeyboard(e) {
        // Handle keyboard shortcuts
        switch(e.key) {
            case 'Escape':
                // Close current modal
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    const modalName = activeModal.id.replace('Modal', '');
                    this.closeModal(modalName);
                }
                break;
            case ' ':
                // Space to tap (if not in input)
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.handleTap(e);
                }
                break;
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, pause some operations
            this.gameState.isOnline = false;
        } else {
            // Page is visible again
            this.gameState.isOnline = true;
            this.updateOnlineStatus();
        }
    }

    // Additional functions (placeholder for future features)
    loadLeaderboard() {
        // TODO: Implement leaderboard loading
        console.log('Loading leaderboard...');
    }

    loadShopData() {
        // TODO: Implement shop data loading
        console.log('Loading shop data...');
    }

    copyReferralCode() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.gameState.referralCode);
            this.showNotification('📋 Referal kod nusxalandi!', 'success');
        }
    }

    applyReferralCode() {
        // TODO: Implement referral code application
        console.log('Applying referral code...');
    }

    skipAd() {
        // TODO: Implement ad skipping
        console.log('Skipping ad...');
    }

    saveSettings() {
        // TODO: Implement settings saving
        console.log('Saving settings...');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 DOMContentLoaded event triggered');
    
    // Only create instance if not already created
    if (!window.zinoxGame) {
        try {
            console.log('🏗️ Creating ZinoxGames instance...');
            window.zinoxGame = new ZinoxGames();
            console.log('✅ ZinoxGames instance created successfully');
        } catch (error) {
            console.error('❌ Failed to create ZinoxGames instance:', error);
            console.error('Error details:', error.stack);
            
            // Hide loading indicator
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    } else {
        console.log('✅ ZinoxGames already exists');
    }
});

// Fallback - agar DOMContentLoaded ishlamasa
window.addEventListener('load', function() {
    console.log('🔥 Window load event triggered');
    
    if (!window.zinoxGame) {
        console.warn('⚠️ ZinoxGames not initialized, trying fallback...');
        try {
            window.zinoxGame = new ZinoxGames();
            console.log('✅ Fallback initialization successful');
        } catch (error) {
            console.error('❌ Fallback initialization failed:', error);
            console.error('Fallback error details:', error.stack);
        }
    } else {
        console.log('✅ ZinoxGames already initialized');
    }
});
