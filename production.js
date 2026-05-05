// PRODUCTION READY ZINOX GAMES
// Optimized for online deployment and marketplace
console.log('🚀 Production Zinox Games loading...');

// Production game state with optimizations
const gameState = {
    zinoxTokens: 0,
    username: 'Player',
    isAuthenticated: false,
    soundEnabled: true,
    vibrationEnabled: true,
    // Energy system (optimized for production)
    energy: 50,
    maxEnergy: 50,
    energyRegenRate: 0.5,
    lastEnergyRegen: Date.now(),
    // Upgrades system (production balanced)
    tapPower: 1,
    autoClickerLevel: 0,
    multiplierLevel: 1,
    comboMasterLevel: 0,
    // Upgrade costs (production optimized)
    upgradeCosts: {
        tapPower: 25,
        autoClicker: 50,
        multiplier: 100,
        comboMaster: 250
    },
    // Auto-clicker
    autoClickerInterval: null,
    // Combo system
    comboSystem: {
        isActive: false,
        multiplier: 1,
        progress: 0,
        maxProgress: 100,
        comboTime: 3000,
        lastClickTime: 0,
        clicksInCombo: 0,
        maxComboMultiplier: 10
    },
    // Chat system
    chatMessages: [],
    isChatOpen: false,
    chatLastUpdated: Date.now(),
    // Production features
    isProductionMode: true,
    version: '1.0.0',
    lastSaveTime: 0
};

// Production initialization with error handling
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Production: DOM loaded');
    
    // Production initialization with timeout protection
    initializeProductionGame();
});

async function initializeProductionGame() {
    try {
        // Show loading
        showLoadingScreen();
        
        // Initialize services with timeout
        await Promise.race([
            initializeServices(),
            new Promise(resolve => setTimeout(resolve, 3000))
        ]);
        
        // Hide loading and show game
        hideLoadingScreen();
        showAuthModal();
        
        // Setup game systems
        setupGameSystems();
        
        console.log('✅ Production: Game ready!');
        
    } catch (error) {
        console.error('❌ Production initialization failed:', error);
        // Fallback to basic game
        initializeFallbackGame();
    }
}

function showLoadingScreen() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
        loadingIndicator.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h2>💎 ZINOX GAMES</h2>
                <p>Production Serverga ulanmoqda...</p>
                <div class="loading-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
    }
}

function hideLoadingScreen() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

async function initializeServices() {
    // Initialize Supabase with production settings
    await initializeSupabase();
    
    // Load saved game state
    await loadGameState();
    
    // Initialize analytics (production only)
    if (gameState.isProductionMode) {
        initializeAnalytics();
    }
}

function initializeFallbackGame() {
    console.log('🔄 Initializing fallback game');
    
    // Basic game without database
    gameState.isProductionMode = false;
    
    hideLoadingScreen();
    showAuthModal();
    setupGameSystems();
    
    console.log('✅ Fallback game ready');
}

function setupGameSystems() {
    // Setup tap functionality
    setupTapArea();
    
    // Setup auth
    setupAuth();
    
    // Setup upgrade buttons
    setupUpgradeButtons();
    
    // Setup dashboard
    setupDashboardButtons();
    
    // Setup chat
    setupChatSystem();
    
    // Start game loops
    startGameLoops();
    
    // Add production styles
    addProductionStyles();
    
    updateDisplay();
}

function setupTapArea() {
    const tapArea = document.getElementById('tapArea');
    if (!tapArea) return;
    
    tapArea.addEventListener('click', function(event) {
        if (gameState.energy <= 0) {
            showNotification('⚡ Energy yo\'q! Kuting...', 'warning');
            return;
        }
        
        // Consume energy
        gameState.energy = Math.max(0, gameState.energy - 1);
        
        // Handle combo
        handleCombo();
        
        // Calculate tokens
        const baseTokens = gameState.tapPower * gameState.multiplierLevel;
        const comboMultiplier = gameState.comboSystem.multiplier;
        const tokensEarned = Math.floor(baseTokens * comboMultiplier);
        
        gameState.zinoxTokens += tokensEarned;
        
        // Effects
        playTapSound(comboMultiplier > 1);
        createTokenEffect(event.clientX, event.clientY, comboMultiplier > 1);
        
        if (gameState.vibrationEnabled && navigator.vibrate) {
            const pattern = comboMultiplier > 1 ? [50, 30, 50] : 50;
            navigator.vibrate(pattern);
        }
        
        updateDisplay();
        saveGameState();
        
        // Analytics event (production only)
        if (gameState.isProductionMode) {
            trackEvent('tap_earned', { tokens: tokensEarned, combo: comboMultiplier });
        }
    });
}

function setupAuth() {
    const signInBtn = document.getElementById('signInBtn');
    if (!signInBtn) return;
    
    signInBtn.addEventListener('click', function() {
        const username = document.getElementById('signInNickname')?.value || 'Player';
        gameState.username = username;
        gameState.isAuthenticated = true;
        
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'none';
        }
        
        updateDisplay();
        
        // Analytics
        if (gameState.isProductionMode) {
            trackEvent('user_signed_in', { username });
        }
    });
}

function startGameLoops() {
    // Energy regeneration
    startEnergyRegeneration();
    
    // Combo timer
    startComboTimer();
    
    // Auto-clicker
    if (gameState.autoClickerLevel > 0) {
        startAutoClicker();
    }
    
    // Auto-save (production only)
    if (gameState.isProductionMode) {
        setInterval(saveGameState, 30000);
    }
}

function initializeAnalytics() {
    // Simple analytics tracking
    window.trackEvent = function(eventName, data) {
        console.log('📊 Analytics:', eventName, data);
        // In production, this would send to analytics service
    };
}

function trackEvent(eventName, data) {
    if (window.trackEvent) {
        window.trackEvent(eventName, data);
    }
}

// Production optimized styles
function addProductionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes tokenFloat {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
        
        @keyframes comboFloat {
            0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
            50% { transform: translateY(-50px) scale(1.8) rotate(180deg); opacity: 1; }
            100% { transform: translateY(-150px) scale(2.5) rotate(360deg); opacity: 0; }
        }
        
        @keyframes tapPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        @keyframes comboGlow {
            0% { box-shadow: 0 0 5px #ff00ff; }
            50% { box-shadow: 0 0 30px #ff00ff, 0 0 50px #ff00ff, 0 0 70px #ff00ff; }
            100% { box-shadow: 0 0 5px #ff00ff; }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes messageSlideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .loading-content {
            text-align: center;
            color: white;
            padding: 20px;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #00ff88;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        .loading-progress {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin: 20px auto;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #00ff88, #00cc66);
            animation: pulse 1.5s ease-in-out infinite;
            width: 100%;
        }
        
        #tapArea:active {
            animation: tapPulse 0.2s ease-out;
        }
        
        #tapArea.combo-active {
            animation: comboGlow 0.5s ease-out infinite;
        }
        
        .energy-fill {
            transition: width 0.3s ease, background 0.3s ease;
        }
        
        .combo-progress {
            transition: width 0.1s ease, background 0.3s ease;
        }
        
        .nav-btn {
            transition: all 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 255, 136, 0.3);
        }
        
        .nav-btn.active {
            background: linear-gradient(135deg, #00ff88, #00cc66);
            transform: scale(1.05);
        }
        
        .upgrade-btn {
            transition: all 0.3s ease;
        }
        
        .upgrade-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 255, 136, 0.3);
        }
        
        .upgrade-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .upgrade-card {
            transition: all 0.3s ease;
        }
        
        .upgrade-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 255, 136, 0.2);
        }
        
        #comboDisplay {
            animation: comboGlow 1s ease-out infinite;
        }
        
        .chat-modal {
            max-width: 400px;
            max-height: 600px;
        }
        
        .chat-content {
            display: flex;
            flex-direction: column;
            height: 500px;
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            margin-bottom: 10px;
        }
        
        .chat-message {
            margin-bottom: 10px;
            animation: messageSlideIn 0.3s ease-out;
        }
        
        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
        
        .chat-username {
            font-weight: bold;
            color: #00ff88;
        }
        
        .chat-time {
            font-size: 0.8rem;
            color: #888;
        }
        
        .chat-text {
            color: #fff;
            word-wrap: break-word;
        }
        
        .user-message .chat-username {
            color: #00aaff;
        }
        
        .bot-message .chat-username {
            color: #ff8800;
        }
        
        .system-message {
            background: rgba(0, 255, 136, 0.1);
            border-left: 3px solid #00ff88;
            padding: 10px;
            border-radius: 5px;
            color: #00ff88;
            font-style: italic;
        }
        
        .chat-input-container {
            display: flex;
            gap: 10px;
        }
        
        .chat-input-container input {
            flex: 1;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            color: #fff;
        }
        
        .chat-send-btn {
            padding: 10px 15px;
            background: linear-gradient(135deg, #00ff88, #00cc66);
            border: none;
            border-radius: 5px;
            color: #000;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .chat-send-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 255, 136, 0.3);
        }
        
        .settings-modal {
            max-width: 500px;
            max-height: 80vh;
        }
        
        .settings-content {
            padding: 20px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .settings-section {
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(0, 255, 136, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(0, 255, 136, 0.3);
        }
        
        .settings-section h3 {
            margin: 0 0 10px 0;
            color: #00ff88;
            font-size: 1.1rem;
        }
        
        .settings-btn {
            width: 100%;
            padding: 10px;
            background: linear-gradient(135deg, #00ff88, #00cc66);
            border: none;
            border-radius: 8px;
            color: #000;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .settings-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 255, 136, 0.3);
        }
        
        .settings-toggle {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }
        
        .settings-toggle input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }
        
        .settings-toggle span {
            color: #fff;
            font-weight: 500;
        }
        
        .footer-nav {
            justify-content: space-around;
        }
        
        .nav-btn {
            flex: 1;
            margin: 0 5px;
        }
        
        /* Production optimizations */
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
            .chat-modal {
                max-width: 95%;
                max-height: 80vh;
            }
            
            .settings-modal {
                max-width: 95%;
            }
            
            .nav-btn {
                font-size: 0.8rem;
                padding: 8px 4px;
            }
        }
        
        /* Performance optimizations */
        .token-effect {
            will-change: transform, opacity;
        }
        
        .combo-effect {
            will-change: transform, opacity;
        }
    `;
    document.head.appendChild(style);
}

// Export for global access
window.gameState = gameState;
window.toggleChat = toggleChat;

console.log('🚀 Production Zinox Games loaded successfully!');
