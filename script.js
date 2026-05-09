// Zinox Games - Complete Game Logic (Fixed Version)
// Author: Senior Full-Stack Developer
// Version: 2.0 Production Ready

class ZinoxGames {
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
        
        // Admin state
        this.isAdminLoggedIn = false;
        this.adminCredentials = {
            username: 'admin',
            password: 'zinox2024'
        };
        
        // Initialize
        this.init();
    }

    async init() {
        console.log('🎮 Zinox Games ishga tushirilmoqda...');
        
        // Loading screen
        this.showLoadingScreen();
        
        // Simulate loading progress
        await this.simulateLoadingProgress();
        
        // Initialize elements
        this.updateLoadingText('Elementlar yuklanmoqda...');
        this.initializeElements();
        
        // Load saved game state
        this.updateLoadingText('O\'yin holati yuklanmoqda...');
        await this.loadGameState();
        
        // Setup event listeners
        this.updateLoadingText('Tadbirlar sozlanmoqda...');
        this.setupEventListeners();
        
        // Initialize systems
        this.updateLoadingText('Tizimlar ishga tushirilmoqda...');
        this.initializeSystems();
        
        // Start game loops
        this.updateLoadingText('O\'yin tsikllari yoqilmoqda...');
        this.startGameLoops();
        
        // Complete loading
        this.updateLoadingProgress(100);
        this.updateLoadingText('O\'in tayyor!');
        
        // Hide loading screen and show auth if not authenticated
        setTimeout(() => {
            this.hideLoadingScreen();
            
            if (!this.gameState.isAuthenticated) {
                this.openModal('auth');
            } else {
                this.showNotification('🎮 O\'yin yuklandi! Omad!', 'success');
            }
        }, 1000);
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
        this.elements.energyBar = document.getElementById('energyFill');
        this.elements.energyText = document.getElementById('energyText');
        
        // Upgrade buttons
        this.elements.buyTapPower = document.getElementById('buyTapPower');
        this.elements.buyAutoClicker = document.getElementById('buyAutoClicker');
        this.elements.buyMultiplier = document.getElementById('buyMultiplier');
        this.elements.buyComboMaster = document.getElementById('buyComboMaster');
        
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
            chat: document.getElementById('chatModal'),
            adminLogin: document.getElementById('adminLoginModal'),
            adminPanel: document.getElementById('adminPanelModal')
        };
        
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
        
        // Footer navigation
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleFooterNav(btn.dataset.tab));
        });
        
        // Settings button
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.openModal('settings'));
        }
        
        // Admin access button
        const adminAccessBtn = document.getElementById('adminAccessBtn');
        if (adminAccessBtn) {
            adminAccessBtn.addEventListener('click', () => this.openAdminLogin());
        }
        
        // Auth listeners
        this.setupAuthListeners();
        
        // Admin listeners
        this.setupAdminEventListeners();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Page visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Before unload
        window.addEventListener('beforeunload', () => this.saveGameState());
        
        console.log('✅ Barcha tadbirlar muvaffaqiyatli sozlandi');
    }

    setupAuthListeners() {
        // Auth modal elements
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

    setupAdminEventListeners() {
        // Admin login
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', () => this.handleAdminLogin());
        }
        
        // Close admin login
        const closeAdminLogin = document.getElementById('closeAdminLogin');
        if (closeAdminLogin) {
            closeAdminLogin.addEventListener('click', () => this.closeModal('adminLogin'));
        }
        
        // Close admin panel
        const closeAdminPanel = document.getElementById('closeAdminPanel');
        if (closeAdminPanel) {
            closeAdminPanel.addEventListener('click', () => this.closeModal('adminPanel'));
        }
        
        // Admin tabs
        const adminTabs = document.querySelectorAll('.admin-tab');
        adminTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchAdminTab(tab.dataset.tab));
        });
        
        // Mission type change
        const missionType = document.getElementById('missionType');
        if (missionType) {
            missionType.addEventListener('change', () => this.handleMissionTypeChange());
        }
        
        // Admin buttons
        this.setupAdminButtons();
    }

    setupAdminButtons() {
        // User management
        const searchUserBtn = document.getElementById('searchUserBtn');
        if (searchUserBtn) {
            searchUserBtn.addEventListener('click', () => this.searchUser());
        }
        
        const donateToUserBtn = document.getElementById('donateToUserBtn');
        if (donateToUserBtn) {
            donateToUserBtn.addEventListener('click', () => this.donateToUser());
        }
        
        // Project donate
        const projectDonateBtn = document.getElementById('projectDonateBtn');
        if (projectDonateBtn) {
            projectDonateBtn.addEventListener('click', () => this.projectDonate());
        }
        
        // Ad upload
        const uploadAdBtn = document.getElementById('uploadAdBtn');
        if (uploadAdBtn) {
            uploadAdBtn.addEventListener('click', () => this.uploadAd());
        }
        
        // Mission creation
        const createMissionBtn = document.getElementById('createMissionBtn');
        if (createMissionBtn) {
            createMissionBtn.addEventListener('click', () => this.createMission());
        }
        
        // Global settings
        const saveGlobalSettingsBtn = document.getElementById('saveGlobalSettingsBtn');
        if (saveGlobalSettingsBtn) {
            saveGlobalSettingsBtn.addEventListener('click', () => this.saveGlobalSettings());
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
        
        // Update energy display
        this.updateEnergyDisplay();
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
            if (modalName === 'adminPanel') {
                this.loadAdminData();
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
            case 'settings':
                this.openModal('settings');
                break;
            case 'missions':
                if (this.gameState.isAuthenticated) {
                    this.openModal('missions');
                } else {
                    this.openModal('auth');
                }
                break;
            case 'chat':
                if (this.gameState.isAuthenticated) {
                    this.openModal('chat');
                } else {
                    this.openModal('auth');
                }
                break;
        }
    }

    // Authentication functions
    async handleSignIn() {
        const phone = document.getElementById('signInPhone').value.trim();
        const password = document.getElementById('signInPassword').value.trim();
        const nickname = document.getElementById('signInNickname').value.trim();
        const telegram = document.getElementById('signInTelegram').value.trim();
        
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
            
            // Load users from localStorage
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
            this.gameState.phone = phone;
            this.gameState.username = user.username;
            this.gameState.userId = user.userId;
            this.gameState.telegram = user.telegram;
            this.gameState.cashBalance = user.cashBalance || 0;
            this.gameState.zinoxTokens = user.zinoxTokens || 0;
            this.gameState.totalClicks = user.totalClicks || 0;
            
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
        const phone = document.getElementById('signUpPhone').value.trim();
        const password = document.getElementById('signUpPassword').value.trim();
        const confirmPassword = document.getElementById('signUpPasswordConfirm').value.trim();
        const username = document.getElementById('signUpNickname').value.trim();
        const telegram = document.getElementById('signUpTelegram').value.trim();
        
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
            
            // Load users from localStorage
            const users = JSON.parse(localStorage.getItem('zinoxUsers') || '[]');
            
            if (users.find(u => u.phone === phone)) {
                this.showNotification('❌ Bu telefon raqami allaqachon ro\'yxatdan o\'tgan', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                userId: this.generateUserId(),
                phone: phone,
                username: username,
                telegram: telegram,
                password: password,
                referralCode: this.gameState.referralCode,
                zinoxTokens: 0,
                cashBalance: 0,
                totalClicks: 0,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('zinoxUsers', JSON.stringify(users));
            
            // Update game state
            this.gameState.isAuthenticated = true;
            this.gameState.phone = phone;
            this.gameState.username = username;
            this.gameState.telegram = telegram;
            this.gameState.userId = newUser.userId;
            
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
        const signInForm = document.getElementById('signInForm');
        const signUpForm = document.getElementById('signUpForm');
        const authTitle = document.getElementById('authTitle');
        const authSwitchBtn = document.getElementById('authSwitchBtn');
        const authSwitchText = document.getElementById('authSwitchText');
        
        if (signInForm.style.display === 'none') {
            // Switch to sign in
            signInForm.style.display = 'block';
            signUpForm.style.display = 'none';
            authTitle.textContent = '🔐 KIRISH';
            authSwitchBtn.textContent = 'Ro\'yxatdan o\'tish';
            authSwitchText.textContent = 'Hisobingiz yo\'qmi?';
        } else {
            // Switch to sign up
            signInForm.style.display = 'none';
            signUpForm.style.display = 'block';
            authTitle.textContent = '📝 RO\'YXATDAN O\'TISH';
            authSwitchBtn.textContent = 'Kirish';
            authSwitchText.textContent = 'Hisobingiz bormi?';
        }
    }

    validatePhoneNumber(phone) {
        // Uzbek phone number validation
        const phoneRegex = /^(\+998)?(90|91|92|93|94|95|96|97|98|99)\d{7}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    generateUserId() {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Settings functions
    saveSettings() {
        // Get settings values
        const username = document.getElementById('usernameInput')?.value || this.gameState.username;
        const soundEnabled = document.getElementById('soundToggle')?.checked || false;
        const vibrationEnabled = document.getElementById('vibrationToggle')?.checked || false;
        const language = document.getElementById('languageSelect')?.value || 'uz';
        const theme = document.getElementById('themeSelect')?.value || 'dark';
        const pushNotifications = document.getElementById('pushNotifications')?.checked || false;
        const autoSave = document.getElementById('autoSave')?.checked || true;
        
        // Update game state
        this.gameState.username = username;
        this.config.soundEnabled = soundEnabled;
        this.config.vibrationEnabled = vibrationEnabled;
        this.config.language = language;
        this.config.theme = theme;
        this.config.pushNotifications = pushNotifications;
        this.config.autoSave = autoSave;
        
        // Apply theme
        this.applyTheme(theme);
        
        // Save settings
        localStorage.setItem('zinoxSettings', JSON.stringify({
            soundEnabled, vibrationEnabled, language, theme, pushNotifications, autoSave
        }));
        
        // Update UI
        this.updateUI();
        
        // Close modal
        this.closeModal('settings');
        
        this.showNotification('✅ Sozlamalar saqlandi!', 'success');
    }

    applyTheme(theme) {
        // Remove existing theme classes
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-auto');
        
        // Apply new theme
        if (theme === 'auto') {
            const hour = new Date().getHours();
            const isDark = hour >= 18 || hour < 6;
            document.body.classList.add(isDark ? 'theme-dark' : 'theme-light');
        } else {
            document.body.classList.add(`theme-${theme}`);
        }
    }

    // Admin Panel Functions
    openAdminLogin() {
        this.openModal('adminLogin');
    }

    handleAdminLogin() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        
        if (!username || !password) {
            this.showNotification('❌ Login va parolni kiriting!', 'error');
            return;
        }
        
        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            this.isAdminLoggedIn = true;
            this.closeModal('adminLogin');
            this.openModal('adminPanel');
            this.showNotification('👑 Admin panelga muvaffaqiyatli kirildi!', 'success');
        } else {
            this.showNotification('❌ Login yoki parol noto\'g\'ri!', 'error');
        }
    }

    switchAdminTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        
        const activeTab = document.getElementById(tabName + 'Tab');
        if (activeTab) {
            activeTab.style.display = 'block';
            activeTab.classList.add('active');
        }
        
        // Load tab-specific data
        this.loadAdminTabData(tabName);
    }

    loadAdminTabData(tabName) {
        switch(tabName) {
            case 'users':
                this.loadUsersList();
                break;
            case 'donate':
                this.loadDonateStats();
                break;
            case 'ads':
                this.loadAdsList();
                break;
            case 'missions':
                this.loadMissionsList();
                break;
            case 'settings':
                this.loadGlobalSettings();
                break;
        }
    }

    loadAdminData() {
        this.loadUsersList();
        this.loadDonateStats();
        this.loadAdsList();
        this.loadMissionsList();
        this.loadGlobalSettings();
    }

    loadUsersList() {
        const usersList = document.getElementById('adminUsersList');
        if (!usersList) return;
        
        // Load users from localStorage
        const users = JSON.parse(localStorage.getItem('zinoxUsers') || '[]');
        
        // Display users
        usersList.innerHTML = '';
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'admin-user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <span class="user-id">ID: ${user.userId}</span>
                    <span class="user-name">${user.username}</span>
                    <span class="user-phone">${user.phone}</span>
                </div>
                <div class="user-stats">
                    <span class="user-tokens">💎 ${user.zinoxTokens || 0}</span>
                    <span class="user-cash">$ ${user.cashBalance || 0}</span>
                </div>
            `;
            usersList.appendChild(userItem);
        });
        
        if (users.length === 0) {
            usersList.innerHTML = '<p class="no-data">Foydalanuvchilar topilmadi</p>';
        }
    }

    searchUser() {
        const searchInput = document.getElementById('userSearchInput').value.trim();
        if (!searchInput) {
            this.showNotification('❌ Qidiruv so\'zini kiriting!', 'error');
            return;
        }
        
        // Search users
        const users = JSON.parse(localStorage.getItem('zinoxUsers') || '[]');
        
        const foundUser = users.find(user => 
            user.userId === searchInput || 
            user.username.toLowerCase().includes(searchInput.toLowerCase())
        );
        
        if (foundUser) {
            document.getElementById('selectedUserId').value = foundUser.userId;
            this.showNotification(`✅ Foydalanuvchi topildi: ${foundUser.username}`, 'success');
        } else {
            this.showNotification('❌ Foydalanuvchi topilmadi!', 'error');
        }
    }

    donateToUser() {
        const userId = document.getElementById('selectedUserId').value.trim();
        const amount = parseFloat(document.getElementById('donateAmount').value);
        
        if (!userId || !amount || amount <= 0) {
            this.showNotification('❌ User ID va miqdorni to\'g\'ri kiriting!', 'error');
            return;
        }
        
        // Find user
        const users = JSON.parse(localStorage.getItem('zinoxUsers') || '[]');
        
        const userIndex = users.findIndex(user => user.userId === userId);
        if (userIndex === -1) {
            this.showNotification('❌ Foydalanuvchi topilmadi!', 'error');
            return;
        }
        
        // Update user balance
        users[userIndex].cashBalance = (users[userIndex].cashBalance || 0) + amount;
        
        // Save users
        localStorage.setItem('zinoxUsers', JSON.stringify(users));
        
        // Log donation
        this.logDonation(userId, amount, 'admin_donate');
        
        // Clear form
        document.getElementById('selectedUserId').value = '';
        document.getElementById('donateAmount').value = '';
        
        // Refresh users list
        this.loadUsersList();
        
        this.showNotification(`✅ ${amount} cash userga yuborildi!`, 'success');
    }

    projectDonate() {
        const amount = parseFloat(document.getElementById('projectDonateAmount').value);
        const method = document.getElementById('paymentMethod').value;
        const note = document.getElementById('donateNote').value.trim();
        
        if (!amount || amount <= 0) {
            this.showNotification('❌ Miqdorni to\'g\'ri kiriting!', 'error');
            return;
        }
        
        // Log project donation
        this.logProjectDonation(amount, method, note);
        
        // Clear form
        document.getElementById('projectDonateAmount').value = '';
        document.getElementById('donateNote').value = '';
        
        // Update stats
        this.loadDonateStats();
        
        this.showNotification(`✅ Projectga ${amount} cash donat qilindi!`, 'success');
    }

    uploadAd() {
        const file = document.getElementById('adFile').files[0];
        const type = document.getElementById('adType').value;
        const title = document.getElementById('adTitle').value.trim();
        const link = document.getElementById('adLink').value.trim();
        const duration = parseInt(document.getElementById('adDuration').value);
        
        if (!file || !title) {
            this.showNotification('❌ Fayl va nomni kiriting!', 'error');
            return;
        }
        
        // Read file and store
        const reader = new FileReader();
        reader.onload = (e) => {
            const ad = {
                id: Date.now().toString(),
                type: type,
                title: title,
                link: link,
                duration: duration,
                data: e.target.result,
                createdAt: new Date().toISOString()
            };
            
            // Save ad
            const ads = JSON.parse(localStorage.getItem('zinoxAds') || '[]');
            ads.push(ad);
            localStorage.setItem('zinoxAds', JSON.stringify(ads));
            
            // Clear form
            document.getElementById('adFile').value = '';
            document.getElementById('adTitle').value = '';
            document.getElementById('adLink').value = '';
            document.getElementById('adDuration').value = '15';
            
            // Refresh ads list
            this.loadAdsList();
            
            this.showNotification('✅ Reklama yuklandi!', 'success');
        };
        
        reader.readAsDataURL(file);
    }

    createMission() {
        const type = document.getElementById('missionType').value;
        const title = document.getElementById('missionTitle').value.trim();
        const description = document.getElementById('missionDescription').value.trim();
        const target = parseInt(document.getElementById('missionTarget').value);
        const reward = parseInt(document.getElementById('missionReward').value);
        const channelUrl = document.getElementById('channelUrl')?.value.trim() || '';
        
        if (!title || !description || !target || !reward) {
            this.showNotification('❌ Barcha maydonlarni to\'ldiring!', 'error');
            return;
        }
        
        const mission = {
            id: Date.now().toString(),
            type: type,
            title: title,
            description: description,
            target: target,
            reward: reward,
            channelUrl: channelUrl,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        // Save mission
        const missions = JSON.parse(localStorage.getItem('zinoxMissions') || '[]');
        missions.push(mission);
        localStorage.setItem('zinoxMissions', JSON.stringify(missions));
        
        // Clear form
        document.getElementById('missionTitle').value = '';
        document.getElementById('missionDescription').value = '';
        document.getElementById('missionTarget').value = '';
        document.getElementById('missionReward').value = '';
        document.getElementById('channelUrl').value = '';
        
        // Refresh missions list
        this.loadMissionsList();
        
        this.showNotification('✅ Missiya yaratildi!', 'success');
    }

    handleMissionTypeChange() {
        const type = document.getElementById('missionType').value;
        const channelUrlGroup = document.getElementById('channelUrlGroup');
        
        if (type === 'channel') {
            channelUrlGroup.style.display = 'block';
        } else {
            channelUrlGroup.style.display = 'none';
        }
    }

    saveGlobalSettings() {
        const settings = {
            initialTokens: parseInt(document.getElementById('initialTokens').value),
            initialCash: parseInt(document.getElementById('initialCash').value),
            autoSaveInterval: parseInt(document.getElementById('autoSaveInterval').value),
            tokenCashRate: parseFloat(document.getElementById('tokenCashRate').value),
            adReward: parseInt(document.getElementById('adReward').value)
        };
        
        // Save settings
        localStorage.setItem('zinoxGlobalSettings', JSON.stringify(settings));
        
        // Apply settings
        this.config.autoSaveInterval = settings.autoSaveInterval * 1000;
        
        this.showNotification('✅ Global sozlamalar saqlandi!', 'success');
    }

    loadDonateStats() {
        const totalDonates = document.getElementById('totalDonates');
        const lastDonate = document.getElementById('lastDonate');
        
        // Get donation stats
        const donations = JSON.parse(localStorage.getItem('zinoxProjectDonations') || '[]');
        const total = donations.reduce((sum, d) => sum + d.amount, 0);
        const last = donations.length > 0 ? donations[donations.length - 1] : null;
        
        if (totalDonates) totalDonates.textContent = `${total} $`;
        if (lastDonate) lastDonate.textContent = last ? new Date(last.createdAt).toLocaleString() : 'Yo\'q';
    }

    loadAdsList() {
        const adsList = document.getElementById('adminAdsList');
        if (!adsList) return;
        
        const ads = JSON.parse(localStorage.getItem('zinoxAds') || '[]');
        
        adsList.innerHTML = '';
        ads.forEach(ad => {
            const adItem = document.createElement('div');
            adItem.className = 'admin-ad-item';
            adItem.innerHTML = `
                <div class="ad-info">
                    <span class="ad-title">${ad.title}</span>
                    <span class="ad-type">${ad.type}</span>
                    <span class="ad-duration">${ad.duration}s</span>
                </div>
                <div class="ad-actions">
                    <button class="admin-btn-small" onclick="zinoxGame.deleteAd('${ad.id}')">🗑️</button>
                </div>
            `;
            adsList.appendChild(adItem);
        });
        
        if (ads.length === 0) {
            adsList.innerHTML = '<p class="no-data">Reklamalar topilmadi</p>';
        }
    }

    loadMissionsList() {
        const missionsList = document.getElementById('adminMissionsList');
        if (!missionsList) return;
        
        const missions = JSON.parse(localStorage.getItem('zinoxMissions') || '[]');
        
        missionsList.innerHTML = '';
        missions.forEach(mission => {
            const missionItem = document.createElement('div');
            missionItem.className = 'admin-mission-item';
            missionItem.innerHTML = `
                <div class="mission-info">
                    <span class="mission-title">${mission.title}</span>
                    <span class="mission-type">${mission.type}</span>
                    <span class="mission-reward">💎 ${mission.reward}</span>
                </div>
                <div class="mission-actions">
                    <button class="admin-btn-small" onclick="zinoxGame.deleteMission('${mission.id}')">🗑️</button>
                </div>
            `;
            missionsList.appendChild(missionItem);
        });
        
        if (missions.length === 0) {
            missionsList.innerHTML = '<p class="no-data">Missiyalar topilmadi</p>';
        }
    }

    loadGlobalSettings() {
        const settings = JSON.parse(localStorage.getItem('zinoxGlobalSettings') || '{}');
        
        document.getElementById('initialTokens').value = settings.initialTokens || 0;
        document.getElementById('initialCash').value = settings.initialCash || 0;
        document.getElementById('autoSaveInterval').value = settings.autoSaveInterval || 30;
        document.getElementById('tokenCashRate').value = settings.tokenCashRate || 100;
        document.getElementById('adReward').value = settings.adReward || 5;
    }

    deleteAd(adId) {
        const ads = JSON.parse(localStorage.getItem('zinoxAds') || '[]');
        const filteredAds = ads.filter(ad => ad.id !== adId);
        localStorage.setItem('zinoxAds', JSON.stringify(filteredAds));
        this.loadAdsList();
        this.showNotification('✅ Reklama o\'chirildi!', 'success');
    }

    deleteMission(missionId) {
        const missions = JSON.parse(localStorage.getItem('zinoxMissions') || '[]');
        const filteredMissions = missions.filter(m => m.id !== missionId);
        localStorage.setItem('zinoxMissions', JSON.stringify(filteredMissions));
        this.loadMissionsList();
        this.showNotification('✅ Missiya o\'chirildi!', 'success');
    }

    logDonation(userId, amount, type) {
        const donations = JSON.parse(localStorage.getItem('zinoxDonations') || '[]');
        donations.push({
            userId: userId,
            amount: amount,
            type: type,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('zinoxDonations', JSON.stringify(donations));
    }

    logProjectDonation(amount, method, note) {
        const donations = JSON.parse(localStorage.getItem('zinoxProjectDonations') || '[]');
        donations.push({
            amount: amount,
            method: method,
            note: note,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('zinoxProjectDonations', JSON.stringify(donations));
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
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.zinoxGame = new ZinoxGames();
});
