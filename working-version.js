// 🚀 ZINOX GAMES WORKING - ONLINE VERSION
// Working version with Supabase integration
console.log('🚀 ZINOX GAMES WORKING - Online version loading...');

// Supabase initialization
let supabase = null;

// Simple game state with Cash system and Turbo mode
const gameState = {
    zinoxTokens: 0,
    cash: 0,
    username: 'Player',
    isAuthenticated: false,
    soundEnabled: true,
    vibrationEnabled: true,
    energy: 50,
    maxEnergy: 50,
    energyRegenRate: 0.5,
    lastEnergyRegen: Date.now(),
    // Cash upgrades (premium only)
    cashUpgradeCosts: {
        tapPower: 4,
        multiplier: 16,
        turbo: 5
    },
    cashUpgradeLevels: {
        tapPower: 0,
        multiplier: 0
    },
    // Turbo mode system
    turboMode: {
        isActive: false,
        endTime: 0,
        duration: 15000, // 15 seconds
        bonusTokens: 5, // +5 tokens per tap
        unlimitedEnergy: true
    },
    chatMessages: [],
    isChatOpen: false,
    chatLastUpdated: Date.now()
};

// Supabase initialization
async function initializeSupabase() {
    try {
        // Wait a bit for Supabase to load (in case CDN is slow)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if Supabase is available
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase not available, using localStorage');
            loadSavedData();
            return;
        }
        
        // Use the provided Supabase credentials
        const supabaseUrl = 'https://btwrcgtrelecucwaruvl.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d3JjZ3RyZWxlY3Vjd2FydXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzQ5MDAsImV4cCI6MjA0ODg1MDkwMH0.2F0j9fLqzv5kK0xK2jTm3fO1lS7qJ8H9X2aYbW3Zc4';
        
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase initialized');
        
        // Test connection
        const { data, error } = await supabase.from('game_states').select('count').limit(1);
        if (error) {
            console.warn('⚠️ Supabase connection test failed, using localStorage:', error);
            loadSavedData();
            return;
        }
        
        console.log('✅ Supabase connection test passed');
        
        // Load saved game state
        await loadGameState();
        
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        // Fallback to localStorage
        loadSavedData();
    }
}

// Load game state from Supabase
async function loadGameState() {
    if (!supabase) {
        console.log('📦 Supabase not available, loading from localStorage');
        loadSavedData();
        return;
    }
    
    try {
        // Get user ID or create one
        let userId = localStorage.getItem('zinoxUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('zinoxUserId', userId);
            console.log('🆔 Created new user ID:', userId);
        }
        
        console.log('🔍 Loading game state for user:', userId);
        
        // Load from Supabase with timeout
        const loadPromise = supabase
            .from('game_states')
            .select('*')
            .eq('user_id', userId)
            .single();
            
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Supabase load timeout')), 3000)
        );
        
        const { data, error } = await Promise.race([loadPromise, timeoutPromise]);
            
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('👋 First time user, creating new state');
                await saveGameState();
            } else {
                console.error('❌ Error loading from Supabase:', error);
                loadSavedData();
                return;
            }
        } else if (data) {
            // Load saved state
            if (data.game_state && typeof data.game_state === 'object') {
                Object.assign(gameState, data.game_state);
                console.log('✅ Game state loaded from Supabase');
            } else {
                console.warn('⚠️ Invalid game state format, using localStorage');
                loadSavedData();
                return;
            }
        }
        
        updateDisplay();
        
    } catch (error) {
        console.error('❌ Error loading game state:', error);
        loadSavedData();
    }
}

// Save game state to Supabase
async function saveGameState() {
    if (!supabase) {
        saveData();
        return;
    }
    
    try {
        const userId = localStorage.getItem('zinoxUserId');
        if (!userId) return;
        
        const gameStateData = {
            user_id: userId,
            game_state: {
                zinoxTokens: gameState.zinoxTokens,
                cash: gameState.cash,
                username: gameState.username,
                isAuthenticated: gameState.isAuthenticated,
                soundEnabled: gameState.soundEnabled,
                vibrationEnabled: gameState.vibrationEnabled,
                energy: gameState.energy,
                maxEnergy: gameState.maxEnergy,
                energyRegenRate: gameState.energyRegenRate,
                lastEnergyRegen: gameState.lastEnergyRegen,
                cashUpgradeCosts: gameState.cashUpgradeCosts,
                cashUpgradeLevels: gameState.cashUpgradeLevels,
                turboMode: gameState.turboMode,
                chatMessages: gameState.chatMessages,
                isChatOpen: gameState.isChatOpen,
                chatLastUpdated: gameState.chatLastUpdated,
                lastSaveTime: Date.now()
            },
            updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('game_states')
            .upsert(gameStateData, {
                onConflict: 'user_id'
            });
            
        if (error) {
            console.error('❌ Error saving to Supabase:', error);
            saveData(); // Fallback to localStorage
        } else {
            console.log('✅ Game state saved to Supabase');
        }
        
    } catch (error) {
        console.error('❌ Error saving game state:', error);
        saveData(); // Fallback to localStorage
    }
}

// Initialize immediately when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 DOM loaded - Starting setup');
    
    // Hide loading immediately to prevent hanging
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
        console.log('✅ Loading indicator hidden immediately');
    }
    
    // Initialize Supabase in background
    initializeSupabase().then(() => {
        console.log('✅ Supabase initialization complete');
    }).catch(error => {
        console.log('⚠️ Supabase initialization failed, using localStorage');
    });
    
    // Load saved data first
    loadSavedData();
    
    // Check if user is already authenticated
    const authModal = document.getElementById('authModal');
    if (gameState.isAuthenticated) {
        // User already logged in, hide auth modal
        if (authModal) {
            authModal.style.display = 'none';
            console.log('✅ User already authenticated, auth modal hidden');
        }
    } else {
        // First time user, show auth modal
        if (authModal) {
            authModal.style.display = 'flex';
            console.log('✅ Auth modal shown for first time user');
        }
    }
    
    // Setup all systems
    setupAllSystems();
    
    // Update display
    updateDisplay();
    
    console.log('✅ ZINOX GAMES: Ready to play!');
});

function loadSavedData() {
    try {
        const savedState = localStorage.getItem('zinoxGameState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            Object.assign(gameState, parsed);
            // Ensure cash is properly initialized
            if (gameState.cash === undefined || gameState.cash === null) {
                gameState.cash = 0;
            }
            // Ensure cash upgrade levels are properly initialized
            if (!gameState.cashUpgradeLevels) {
                gameState.cashUpgradeLevels = {
                    tapPower: 0,
                    multiplier: 0
                };
            }
            console.log('✅ Loaded saved data');
        }
    } catch (error) {
        console.log('⚠️ Could not load saved data');
        // Initialize defaults if loading fails
        gameState.cash = 0;
        gameState.cashUpgradeLevels = {
            tapPower: 0,
            multiplier: 0
        };
    }
}

function setupAllSystems() {
    console.log('🔧 Setting up all systems...');
    
    // Setup tap area
    const tapArea = document.getElementById('tapArea');
    if (tapArea) {
        tapArea.addEventListener('click', function(event) {
            // Check turbo mode
            if (gameState.turboMode.isActive && Date.now() < gameState.turboMode.endTime) {
                // Turbo mode active - unlimited energy and bonus tokens
                const totalTapPower = gameState.cashUpgradeLevels.tapPower;
                const totalMultiplier = gameState.cashUpgradeLevels.multiplier;
                const baseTokens = totalTapPower * totalMultiplier;
                const turboBonus = gameState.turboMode.bonusTokens;
                const tokensEarned = baseTokens + turboBonus;
                
                gameState.zinoxTokens += tokensEarned;
                
                // Effects
                playTapSound(true);
                createTokenEffect(event.clientX, event.clientY, tokensEarned);
                
                // Vibration
                if (gameState.vibrationEnabled && navigator.vibrate) {
                    navigator.vibrate([50, 30, 50]);
                }
                
                // Update and save
                updateDisplay();
                saveData();
                
                console.log('🚀 Turbo tokens earned:', tokensEarned);
                return;
            }
            
            // Normal mode - check energy
            if (gameState.energy <= 0) {
                showNotification('⚡ Energy yo\'q! Kuting...', 'warning');
                return;
            }
            
            // Consume energy
            gameState.energy = Math.max(0, gameState.energy - 1);
            
            // Calculate tokens with cash upgrades only
            const totalTapPower = gameState.cashUpgradeLevels.tapPower || 1;
            const totalMultiplier = gameState.cashUpgradeLevels.multiplier || 1;
            const baseTokens = totalTapPower * totalMultiplier;
            const tokensEarned = Math.floor(baseTokens);
            
            gameState.zinoxTokens += tokensEarned;
            
            // Effects
            playTapSound(false);
            createTokenEffect(event.clientX, event.clientY, tokensEarned);
            
            // Vibration
            if (gameState.vibrationEnabled && navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // Update and save
            updateDisplay();
            saveData();
            
            console.log('💎 Tokens earned:', tokensEarned);
        });
        console.log('✅ Tap area setup complete');
    }
    
    // Setup auth
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
        signInBtn.addEventListener('click', function() {
            const username = document.getElementById('signInNickname')?.value || 'Player';
            gameState.username = username;
            gameState.isAuthenticated = true;
            
            if (authModal) {
                authModal.style.display = 'none';
            }
            
            updateDisplay();
            saveData();
            
            console.log('✅ User authenticated:', username);
        });
        console.log('✅ Auth setup complete');
    }
    
    // Cash upgrade buttons
    const buyCashTapPower = document.getElementById('buyCashTapPower');
    if (buyCashTapPower) {
        buyCashTapPower.addEventListener('click', function() {
            const cost = gameState.cashUpgradeCosts.tapPower;
            if (gameState.cash >= cost) {
                gameState.cash -= cost;
                gameState.cashUpgradeLevels.tapPower++;
                gameState.cashUpgradeCosts.tapPower = Math.floor(cost * 2);
                updateDisplay();
                saveData();
                showNotification('💪 Tap Power (Cash) ko\'tarildi! Yangi quvvat: ' + (gameState.tapPower + gameState.cashUpgradeLevels.tapPower), 'success');
            } else {
                showNotification('💰 Cash yetarli emas! Kerak: $' + cost, 'warning');
            }
        });
    }
    
    const buyCashMultiplier = document.getElementById('buyCashMultiplier');
    if (buyCashMultiplier) {
        buyCashMultiplier.addEventListener('click', function() {
            const cost = gameState.cashUpgradeCosts.multiplier;
            if (gameState.cash >= cost) {
                gameState.cash -= cost;
                gameState.cashUpgradeLevels.multiplier++;
                gameState.cashUpgradeCosts.multiplier = Math.floor(cost * 2);
                updateDisplay();
                saveData();
                showNotification('✨ Multiplier (Cash) ko\'tarildi! Yangi ko\'paytuvchi: x' + (gameState.multiplierLevel + gameState.cashUpgradeLevels.multiplier), 'success');
            } else {
                showNotification('💰 Cash yetarli emas! Kerak: $' + cost, 'warning');
            }
        });
    }
    
    // Turbo mode button
    const buyTurbo = document.getElementById('buyTurbo');
    if (buyTurbo) {
        buyTurbo.addEventListener('click', function() {
            const cost = gameState.cashUpgradeCosts.turbo || 5;
            if (gameState.cash >= cost && !gameState.turboMode.isActive) {
                gameState.cash -= cost;
                activateTurboMode();
                updateDisplay();
                saveData();
                showNotification('🚀 TURBO MODE AKTIV! 15 soniya unlimited energy +5 bonus token!', 'success');
            } else if (gameState.turboMode.isActive) {
                showNotification('🚀 Turbo mode allaqachon aktiv!', 'warning');
            } else {
                showNotification('💰 Cash yetarli emas! Kerak: $' + cost, 'warning');
            }
        });
    }
    
    console.log('✅ Upgrade buttons setup complete');
    
    // Setup dashboard buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            console.log('🔄 Navigation to tab:', tab);
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            switch(tab) {
                case 'game':
                    console.log('🎮 Game tab selected');
                    break;
                case 'chat':
                    toggleChat();
                    break;
                case 'missions':
                    showNotification('🎯 Missiyalar tez kunda...', 'info');
                    break;
                case 'settings':
                    showSettingsModal();
                    break;
            }
        });
    });
    
    console.log('✅ Dashboard buttons setup complete');
    
    // Setup chat system
    const chatModal = document.createElement('div');
    chatModal.id = 'chatModal';
    chatModal.className = 'modal';
    chatModal.innerHTML = `
        <div class="modal-content chat-modal">
            <div class="modal-header">
                <h2>💬 CHAT</h2>
                <button class="close-btn" onclick="toggleChat()">✖️</button>
            </div>
            <div class="chat-content">
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-system-message">
                        💬 ZINOX GAMES Chatga xush kelibsiz!
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" placeholder="Xabar yozing..." maxlength="200">
                    <button class="chat-send-btn" id="chatSendBtn">📤</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(chatModal);
    
    // Add close button event listener directly
    const closeBtn = chatModal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleChat();
        });
    }
    
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    if (chatInput && chatSendBtn) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
        
        chatSendBtn.addEventListener('click', sendChatMessage);
    }
    
    console.log('✅ Chat system setup complete');
    
    // Start game loops
    startGameLoops();
    
    // Add styles
    addWorkingStyles();
    
    console.log('✅ All systems setup complete');
}

function startGameLoops() {
    // Energy regeneration (only when not in turbo mode)
    setInterval(() => {
        if (!gameState.turboMode.isActive && gameState.energy < gameState.maxEnergy) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + gameState.energyRegenRate);
            updateDisplay();
        }
    }, 2000);
    
    // Turbo mode timer
    setInterval(() => {
        if (gameState.turboMode.isActive && Date.now() >= gameState.turboMode.endTime) {
            // Turbo mode ended
            gameState.turboMode.isActive = false;
            gameState.turboMode.endTime = 0;
            updateDisplay();
            showNotification('🚀 Turbo mode tugadi!', 'info');
            console.log('🚀 Turbo mode ended');
        }
    }, 1000);
    
    // Auto-save
    setInterval(saveData, 30000);
    
    console.log('✅ Game loops started');
}

function activateTurboMode() {
    gameState.turboMode.isActive = true;
    gameState.turboMode.endTime = Date.now() + gameState.turboMode.duration;
    
    // Set energy to max for visual effect
    gameState.energy = gameState.maxEnergy;
    
    console.log('🚀 Turbo mode activated for', gameState.turboMode.duration / 1000, 'seconds');
}

// Combo and auto-clicker functions removed as requested

function playTapSound(isCombo = false) {
    if (!gameState.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (isCombo) {
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        } else {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + (isCombo ? 0.15 : 0.1));
    } catch (error) {
        console.log('🔇 Sound not available');
    }
}

function createTokenEffect(x, y, tokensEarned) {
    const token = document.createElement('div');
    token.className = 'token-effect';
    token.textContent = '+' + tokensEarned;
    
    // Apply styles
    token.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        color: #ffff00;
        font-size: 28px;
        font-weight: bold;
        text-shadow: 0 0 15px #ffff00, 0 0 25px #ff9900, 0 0 35px #ff6600, 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        transition: all 1s ease-out;
        animation: tokenFloat 1s ease-out forwards;
        background: rgba(255, 255, 0, 0.1);
        padding: 5px 10px;
        border-radius: 20px;
        border: 2px solid #ffff00;
    `;
    
    document.body.appendChild(token);
    
    // Remove after animation
    setTimeout(() => {
        token.remove();
    }, 1000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? '#ffaa00' : type === 'success' ? '#00ff88' : '#00aaff'};
        color: #000;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateDisplay() {
    // Update token display
    const tokenDisplay = document.getElementById('zinoxAmount');
    if (tokenDisplay) {
        tokenDisplay.textContent = gameState.zinoxTokens.toLocaleString();
    }
    
    // Update cash display - fix undefined issue
    const cashDisplay = document.getElementById('cashAmount');
    if (cashDisplay) {
        const cashAmount = gameState.cash || 0;
        cashDisplay.textContent = '$' + cashAmount.toLocaleString();
    }
    
    // Update username
    const usernameDisplay = document.getElementById('username');
    if (usernameDisplay) {
        usernameDisplay.textContent = gameState.username;
    }
    
    // Update energy display
    const energyFill = document.getElementById('energyFill');
    const energyText = document.getElementById('energyText');
    
    if (energyFill) {
        const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
        energyFill.style.width = `${energyPercent}%`;
        
        if (energyPercent > 50) {
            energyFill.style.background = '#00ff88';
        } else if (energyPercent > 20) {
            energyFill.style.background = '#ffaa00';
        } else {
            energyFill.style.background = '#ff0044';
        }
    }
    
    if (energyText) {
        energyText.textContent = `${gameState.energy}/${gameState.maxEnergy}`;
    }
    
    // Update upgrade displays
    updateUpgradeDisplays();
    
    // Update combo display
    updateComboDisplay();
}

function updateUpgradeDisplays() {
    // Cash upgrades only
    const cashTapPowerLevel = document.getElementById('cashTapPowerLevel');
    const cashTapCost = document.getElementById('cashTapCost');
    if (cashTapPowerLevel) cashTapPowerLevel.textContent = gameState.cashUpgradeLevels.tapPower;
    if (cashTapCost) cashTapCost.textContent = '$' + gameState.cashUpgradeCosts.tapPower;
    
    const cashMultiplierLevel = document.getElementById('cashMultiplierLevel');
    const cashMultiplierCost = document.getElementById('cashMultiplierCost');
    if (cashMultiplierLevel) cashMultiplierLevel.textContent = 'x' + gameState.cashUpgradeLevels.multiplier;
    if (cashMultiplierCost) cashMultiplierCost.textContent = '$' + gameState.cashUpgradeCosts.multiplier;
    
    // Turbo mode display
    const turboCost = document.getElementById('turboCost');
    if (turboCost) {
        const turboCostAmount = gameState.cashUpgradeCosts.turbo || 5;
        turboCost.textContent = '$' + turboCostAmount;
    }
    
    // Update turbo button state
    const turboBtn = document.getElementById('buyTurbo');
    if (turboBtn) {
        if (gameState.turboMode.isActive) {
            turboBtn.textContent = 'TURBO AKTIV!';
            turboBtn.disabled = true;
        } else {
            turboBtn.textContent = 'TURBO MODE';
            turboBtn.disabled = false;
        }
    }
}

function updateComboDisplay() {
    // Combo display removed as requested
    
    // Update turbo mode display
    const turboDisplay = document.getElementById('turboDisplay');
    if (turboDisplay) {
        if (gameState.turboMode.isActive) {
            const remainingTime = Math.max(0, gameState.turboMode.endTime - Date.now());
            const remainingSeconds = Math.ceil(remainingTime / 1000);
            turboDisplay.style.display = 'block';
            turboDisplay.textContent = '🚀 TURBO MODE: ' + remainingSeconds + 's';
        } else {
            turboDisplay.style.display = 'none';
        }
    }
}

function showSettingsModal() {
    const settingsModal = document.createElement('div');
    settingsModal.className = 'modal';
    settingsModal.style.display = 'flex';
    settingsModal.innerHTML = `
        <div class="modal-content settings-modal">
            <div class="modal-header">
                <h2>⚙️ SOZLAMALAR</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✖️</button>
            </div>
            <div class="settings-content">
                <div class="settings-section">
                    <h3>🏆 Reyting</h3>
                    <button class="settings-btn" onclick="showLeaderboard()">🏆 Reytingni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>👤 Profil</h3>
                    <button class="settings-btn" onclick="showProfile()">👤 Profilni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>💎 Donat</h3>
                    <button class="settings-btn" onclick="showDonation()">💎 Donatni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>👥 Referal</h3>
                    <button class="settings-btn" onclick="showReferral()">👥 Referalni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>💰 Do'kon</h3>
                    <button class="settings-btn" onclick="showShop()">💰 Do'konni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>🔊 Ovoz</h3>
                    <label class="settings-toggle">
                        <input type="checkbox" id="soundToggle" ${gameState.soundEnabled ? 'checked' : ''} onchange="toggleSound()">
                        <span>Ovoz effektlari</span>
                    </label>
                </div>
                <div class="settings-section">
                    <h3>📳 Tebranish</h3>
                    <label class="settings-toggle">
                        <input type="checkbox" id="vibrationToggle" ${gameState.vibrationEnabled ? 'checked' : ''} onchange="toggleVibration()">
                        <span>Vibratsiya</span>
                    </label>
                </div>
                <div class="settings-section">
                    <h3>🗂️ Ma'lumotlar</h3>
                    <div class="settings-buttons">
                        <button class="settings-btn" onclick="exportData()">📤 Eksport qilish</button>
                        <button class="settings-btn" onclick="importData()">📥 Import qilish</button>
                        <button class="settings-btn danger" onclick="resetData()">🗑️ Tozalash</button>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>ℹ️ Haqida</h3>
                    <div class="about-info">
                        <p><strong>ZINOX GAMES v1.0</strong></p>
                        <p>Neon cyberpunk incremental clicker o'yini</p>
                        <p>Admin: @cyberscmmr</p>
                        <button class="settings-btn" onclick="showHelp()">❓ Yordam</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(settingsModal);
}

function showLeaderboard() {
    const leaderboardModal = document.createElement('div');
    leaderboardModal.className = 'modal';
    leaderboardModal.style.display = 'flex';
    leaderboardModal.innerHTML = `
        <div class="modal-content leaderboard-modal">
            <div class="modal-header">
                <h2>🏆 REYTING JADVALI</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✖️</button>
            </div>
            <div class="leaderboard-content">
                <div class="leaderboard-list">
                    <div class="leaderboard-item rank-1">
                        <span class="rank">#1</span>
                        <span class="player">CyberPlayer</span>
                        <span class="score">1,234,567</span>
                    </div>
                    <div class="leaderboard-item rank-2">
                        <span class="rank">#2</span>
                        <span class="player">TurboMaster</span>
                        <span class="score">987,654</span>
                    </div>
                    <div class="leaderboard-item rank-3">
                        <span class="rank">#3</span>
                        <span class="player">ZinoxKing</span>
                        <span class="score">876,543</span>
                    </div>
                    <div class="leaderboard-item">
                        <span class="rank">#4</span>
                        <span class="player">CashHunter</span>
                        <span class="score">765,432</span>
                    </div>
                    <div class="leaderboard-item">
                        <span class="rank">#5</span>
                        <span class="player">TurboLegend</span>
                        <span class="score">654,321</span>
                    </div>
                </div>
                <div class="your-rank">
                    <h3>Sizning reytingingiz:</h3>
                    <div class="leaderboard-item your-rank-item">
                        <span class="rank">#42</span>
                        <span class="player">${gameState.username}</span>
                        <span class="score">${gameState.zinoxTokens.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(leaderboardModal);
}

function showProfile() {
    const profileModal = document.createElement('div');
    profileModal.className = 'modal';
    profileModal.style.display = 'flex';
    profileModal.innerHTML = `
        <div class="modal-content profile-modal">
            <div class="modal-header">
                <h2>👤 PROFIL</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✖️</button>
            </div>
            <div class="profile-content">
                <div class="profile-header">
                    <div class="profile-avatar">👤</div>
                    <div class="profile-info">
                        <h3>${gameState.username}</h3>
                        <p>Level: ${Math.floor(gameState.zinoxTokens / 1000) + 1}</p>
                    </div>
                </div>
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-label">💎 Zinox Token</span>
                        <span class="stat-value">${gameState.zinoxTokens.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">💰 Cash</span>
                        <span class="stat-value">$${gameState.cash.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">💪 Tap Power</span>
                        <span class="stat-value">${gameState.cashUpgradeLevels.tapPower}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">✨ Multiplier</span>
                        <span class="stat-value">x${gameState.cashUpgradeLevels.multiplier}</span>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="settings-btn" onclick="changeUsername()">📝 Username o'zgartirish</button>
                    <button class="settings-btn" onclick="shareProfile()">🔤 Profilni ulashish</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(profileModal);
}

function showDonation() {
    const donationModal = document.createElement('div');
    donationModal.className = 'modal';
    donationModal.style.display = 'flex';
    donationModal.innerHTML = `
        <div class="modal-content donation-modal">
            <div class="modal-header">
                <h2>💎 DONAT</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✖️</button>
            </div>
            <div class="donation-content">
                <div class="donation-packages">
                    <div class="package-card">
                        <h3>🥉 BRONZE</h3>
                        <p class="price">10,000 UZS</p>
                        <ul>
                            <li>💰 $50 Cash</li>
                            <li>🚀 Turbo Mode x3</li>
                            <li>💎 1,000 Bonus Token</li>
                        </ul>
                        <button class="donate-btn" onclick="purchasePackage('bronze')">SOTIB OLISH</button>
                    </div>
                    <div class="package-card featured">
                        <h3>🥈 SILVER</h3>
                        <p class="price">25,000 UZS</p>
                        <ul>
                            <li>💰 $150 Cash</li>
                            <li>🚀 Turbo Mode x10</li>
                            <li>💎 5,000 Bonus Token</li>
                            <li>👑 Silver Badge</li>
                        </ul>
                        <button class="donate-btn" onclick="purchasePackage('silver')">SOTIB OLISH</button>
                    </div>
                    <div class="package-card">
                        <h3>🥇 GOLD</h3>
                        <p class="price">50,000 UZS</p>
                        <ul>
                            <li>💰 $350 Cash</li>
                            <li>🚀 Unlimited Turbo</li>
                            <li>💎 15,000 Bonus Token</li>
                            <li>👑 Gold Badge</li>
                        </ul>
                        <button class="donate-btn" onclick="purchasePackage('gold')">SOTIB OLISH</button>
                    </div>
                </div>
                <div class="donation-info">
                    <p>📞 To'lov uchun admin bilan bog'laning: <strong>@cyberscmmr</strong></p>
                    <p>💳 Payme, Click, Uzcard orqali to'lov mumkin</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(donationModal);
}

function showReferral() {
    const referralModal = document.createElement('div');
    referralModal.className = 'modal';
    referralModal.style.display = 'flex';
    referralModal.innerHTML = `
        <div class="modal-content referral-modal">
            <div class="modal-header">
                <h2>👥 REFERAL</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✖️</button>
            </div>
            <div class="referral-content">
                <div class="referral-code">
                    <h3>Sizning referal kodingiz:</h3>
                    <div class="code-display">
                        <span id="referralCode">ZINOX${Math.floor(Math.random() * 10000)}</span>
                        <button class="copy-btn" onclick="copyReferralCode()">📋 Nusxa olish</button>
                    </div>
                </div>
                <div class="referral-stats">
                    <div class="stat-item">
                        <span class="stat-label">👥 Taklif qilinganlar</span>
                        <span class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">💰 Bonus Cash</span>
                        <span class="stat-value">$0</span>
                    </div>
                </div>
                <div class="referral-rules">
                    <h3>📋 Qoidalar:</h3>
                    <ul>
                        <li>👤 Har bir do'stingiz $10 cash oladi</li>
                        <li>💰 Siz har bir do'stingizdan $5 bonus olasiz</li>
                        <li>🎯 Do'stingiz kamida $100 yig'ishi kerak</li>
                        <li>🏆 Top 10 referallar qo'shimcha bonus oladi</li>
                    </ul>
                </div>
                <div class="referral-share">
                    <button class="settings-btn" onclick="shareReferral()">🔤 Ulashish</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(referralModal);
}

function showShop() {
    showNotification('💰 Do\'kon tez kunda ochiladi!', 'info');
}

function toggleSound() {
    const soundToggle = document.getElementById('soundToggle');
    gameState.soundEnabled = soundToggle.checked;
    saveData();
    showNotification(gameState.soundEnabled ? '🔊 Ovoz yoqildi' : '🔇 Ovoz o\'chirildi', 'success');
}

function toggleVibration() {
    const vibrationToggle = document.getElementById('vibrationToggle');
    gameState.vibrationEnabled = vibrationToggle.checked;
    saveData();
    showNotification(gameState.vibrationEnabled ? '📳 Vibratsiya yoqildi' : '📵 Vibratsiya o\'chirildi', 'success');
}

function exportData() {
    const dataStr = JSON.stringify(gameState, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zinox_games_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('📤 Ma\'lumotlar eksport qilindi!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    Object.assign(gameState, importedData);
                    saveData();
                    updateDisplay();
                    showNotification('📥 Ma\'lumotlar import qilindi!', 'success');
                } catch (error) {
                    showNotification('❌ Xatolik! Noto\'g\'ri fayl.', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function resetData() {
    if (confirm('⚠️ Barcha ma\'lumotlarni tozalashni xohlaysizmi? Bu amal ortga qaytarilmaydi!')) {
        localStorage.removeItem('zinoxGameState');
        location.reload();
    }
}

function showHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'modal';
    helpModal.style.display = 'flex';
    helpModal.innerHTML = `
        <div class="modal-content help-modal">
            <div class="modal-header">
                <h2>❌ YORDAM</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✖️</button>
            </div>
            <div class="help-content">
                <div class="help-section">
                    <h3>🎮 O'yin haqida</h3>
                    <p>ZINOX GAMES - neon cyberpunk themed incremental clicker o'yini. Token yig'ing, cash upgrade sotib oling va eng yuqori cho'qqilarga chiqing!</p>
                </div>
                <div class="help-section">
                    <h3>💎 Qanday o'ynash kerak</h3>
                    <ul>
                        <li>💎 Tap buttoniga bosing va token yig'ing</li>
                        <li>⚡ Energy kuzating, u tugamaganda bosing</li>
                        <li>💰 Cash upgrade sotib oling va kuchingizni oshiring</li>
                        <li>🚀 Turbo mode dan foydalaning va tez rivojlaning</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h3>💰 Cash qanday olinadi</h3>
                    <p>Cash faqat admin (@cyberscmmr) tomonidan beriladi. Donat orqali cash olish mumkin.</p>
                </div>
                <div class="help-section">
                    <h3>🚀 Turbo Mode</h3>
                    <p>15 soniya davomida unlimited energy va har bir bosish uchun +5 bonus token.</p>
                </div>
                <div class="help-section">
                    <h3>📞 Bog'lanish</h3>
                    <p>Qo'shimcha savollar uchun admin bilan bog'laning: <strong>@cyberscmmr</strong></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
}

function changeUsername() {
    const newUsername = prompt('Yangi username kiriting:', gameState.username);
    if (newUsername && newUsername.trim()) {
        gameState.username = newUsername.trim();
        saveData();
        updateDisplay();
        showNotification('📝 Username o\'zgartirildi!', 'success');
    }
}

function shareProfile() {
    const profileText = `👤 ZINOX GAMES Profilim:\n🏆 Ism: ${gameState.username}\n💎 Token: ${gameState.zinoxTokens.toLocaleString()}\n💰 Cash: $${gameState.cash.toLocaleString()}\n\n🎮 O'ynash: http://localhost:8000`;
    if (navigator.share) {
        navigator.share({
            title: 'ZINOX GAMES Profil',
            text: profileText
        });
    } else {
        navigator.clipboard.writeText(profileText);
        showNotification('📋 Profil nusxalandi!', 'success');
    }
}

function copyReferralCode() {
    const code = document.getElementById('referralCode').textContent;
    navigator.clipboard.writeText(code);
    showNotification('📋 Referal kodi nusxalandi!', 'success');
}

function shareReferral() {
    const code = document.getElementById('referralCode').textContent;
    const referralText = `👥 ZINOX GAMES da menga qo'shiling!\n🎮 O'ynash: http://localhost:8000\n🎯 Referal kodim: ${code}\n\n💰 Hamma yutadi!`;
    if (navigator.share) {
        navigator.share({
            title: 'ZINOX GAMES Referal',
            text: referralText
        });
    } else {
        navigator.clipboard.writeText(referralText);
        showNotification('📋 Referal havolasi nusxalandi!', 'success');
    }
}

function purchasePackage(packageType) {
    const packages = {
        bronze: { price: '10,000 UZS', cash: 50, tokens: 1000 },
        silver: { price: '25,000 UZS', cash: 150, tokens: 5000 },
        gold: { price: '50,000 UZS', cash: 350, tokens: 15000 }
    };
    
    const pkg = packages[packageType];
    showNotification(`📞 ${pkg.price} to'lov uchun admin bilan bog'laning: @cyberscmmr`, 'info');
}

function toggleChat() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        if (gameState.isChatOpen) {
            chatModal.style.display = 'none';
            gameState.isChatOpen = false;
        } else {
            chatModal.style.display = 'flex';
            gameState.isChatOpen = true;
            setTimeout(() => {
                document.getElementById('chatInput')?.focus();
            }, 100);
        }
    }
}

function sendChatMessage() {
    if (!gameState.isAuthenticated) {
        showNotification('❌ Xabar yuborish uchun ro\'yxatdan o\'ting!', 'warning');
        return;
    }
    
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
    const messageText = chatInput.value.trim();
    
    if (messageText.length === 0) return;
    
    addChatMessage(gameState.username, messageText, 'user');
    chatInput.value = '';
    
    setTimeout(() => {
        const responses = [
            '👍 Yaxshi!',
            '🎮 ZINOX GAMES qiziqarli!',
            '🔥 Combo qiling!',
            '💎 Tokens yig\'ing!',
            '⚡ Energy tekshiring!',
            '🎯 Missiyalarni bajaring!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage('Bot', randomResponse, 'bot');
    }, 1000 + Math.random() * 2000);
}

function addChatMessage(username, message, type = 'user') {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="chat-header">
            <span class="chat-username">${username}</span>
            <span class="chat-time">${time}</span>
        </div>
        <div class="chat-text">${message}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    gameState.chatMessages.push({ username, message, type, timestamp: Date.now() });
    
    if (gameState.chatMessages.length > 50) {
        gameState.chatMessages.shift();
        const firstMessage = chatMessages.firstChild;
        if (firstMessage && firstMessage.className !== 'chat-system-message') {
            firstMessage.remove();
        }
    }
}

function saveData() {
    try {
        // Save to Supabase first (if available)
        saveGameState();
        
        // Also save to localStorage as backup
        const stateToSave = {
            zinoxTokens: gameState.zinoxTokens,
            cash: gameState.cash,
            username: gameState.username,
            isAuthenticated: gameState.isAuthenticated,
            energy: gameState.energy,
            cashUpgradeCosts: gameState.cashUpgradeCosts,
            cashUpgradeLevels: gameState.cashUpgradeLevels,
            turboMode: gameState.turboMode,
            lastSaveTime: Date.now()
        };
        
        localStorage.setItem('zinoxGameState', JSON.stringify(stateToSave));
    } catch (error) {
        console.log('⚠️ Could not save data');
    }
}

// Working styles
function addWorkingStyles() {
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
            cursor: pointer;
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
            cursor: pointer;
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
    `;
    document.head.appendChild(style);
}

// Global exports
window.gameState = gameState;
window.toggleChat = toggleChat;

console.log('✅ ZINOX GAMES WORKING - Ultimate fix loaded successfully!');
