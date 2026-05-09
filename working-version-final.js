// 🚀 ZINOX GAMES - 100% TAYYOR FINAL VERSION
// To'liq ishlaydigan, stabil va toza versiya
console.log('🚀 ZINOX GAMES - 100% TAYYOR FINAL VERSION loading...');

// Game state - to'liq va toza
const gameState = {
    zinoxTokens: 0,
    cash: 0,
    username: 'Player',
    isAuthenticated: false,
    phone: '',
    telegram: '',
    joinedAt: null,
    referralCode: '',
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
    adReward: 1,
    adViewCount: 0,
    adState: {
        isRunning: false,
        startedAt: 0,
        duration: 15000,
        timerId: null
    },
    chatMessages: [],
    isChatOpen: false,
    chatLastUpdated: Date.now()
};

const STORAGE_KEYS = {
    users: 'zinoxUsers',
    session: 'zinoxCurrentUserPhone'
};

const ONLINE_CONFIG = {
    supabaseUrl: 'https://btwrcgtrelecucwaruvl.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d3JjZ3RyZWxlY3Vjd2FydXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzQ5MDAsImV4cCI6MjA0ODg1MDkwMH0.2F0j9fLqzv5kK0xK2jTm3fO1lS7qJ8H9X2aYbW3Zc4'
};

let supabaseClient = null;
let chatSubscription = null;
let leaderboardSubscription = null;
let lastRemoteSyncAt = 0;

function createReferralCode() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let value = '';
    for (let index = 0; index < 8; index += 1) {
        value += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return value;
}

// Initialize immediately when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 DOM loaded - Starting setup');
    
    // Hide loading immediately
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
        console.log('✅ Loading indicator hidden');
    }
    
    // Load saved data first
    loadSavedData();
    restoreCurrentSession();
    hideAllModals();
    
    // Check if user is already authenticated
    const authModal = document.getElementById('authModal');
    if (gameState.isAuthenticated) {
        // User already logged in, hide auth modal
        if (authModal) {
            authModal.style.display = 'none';
        }
    }
    
    // Setup tap area
    const tapArea = document.getElementById('tapArea');
    if (tapArea) {
        tapArea.addEventListener('click', function(event) {
            // Check energy
            if (gameState.turboMode.isActive || gameState.energy >= 1) {
                // Calculate tokens with cash upgrades only
                const totalTapPower = gameState.cashUpgradeLevels.tapPower || 1;
                const totalMultiplier = gameState.cashUpgradeLevels.multiplier || 1;
                let tokensEarned;
                
                if (gameState.turboMode.isActive) {
                    // Turbo mode: base tokens + bonus
                    const baseTokens = totalTapPower * totalMultiplier;
                    tokensEarned = baseTokens + gameState.turboMode.bonusTokens;
                } else {
                    // Normal mode
                    tokensEarned = Math.floor(totalTapPower * totalMultiplier);
                    gameState.energy--;
                }
                
                gameState.zinoxTokens += tokensEarned;
                
                // Effects
                playTapSound(gameState.turboMode.isActive);
                createTokenEffect(event.clientX, event.clientY, tokensEarned);
                
                // Vibration
                if (gameState.vibrationEnabled && navigator.vibrate) {
                    navigator.vibrate([50, 30, 50]);
                }
                
                // Update and save
                updateDisplay();
                saveData();
                
            } else {
                // No energy
                showNotification('⚡ Energiya yetarli emas!', 'warning');
                if (gameState.vibrationEnabled && navigator.vibrate) {
                    navigator.vibrate([100]);
                }
            }
        });
    }
    
    // Setup upgrade buttons
    // Cash tap power upgrade
    const buyCashTapPower = document.getElementById('buyCashTapPower');
    if (buyCashTapPower) {
        buyCashTapPower.addEventListener('click', function() {
            const cost = gameState.cashUpgradeCosts.tapPower;
            if (gameState.cash >= cost) {
                gameState.cash -= cost;
                gameState.cashUpgradeLevels.tapPower++;
                gameState.cashUpgradeCosts.tapPower *= 2;
                updateDisplay();
                saveData();
                showNotification('💪 Tap Power yangilandi!', 'success');
            } else {
                showNotification('💰 Cash yetarli emas! Kerak: $' + cost, 'warning');
            }
        });
    }
    
    // Cash multiplier upgrade
    const buyCashMultiplier = document.getElementById('buyCashMultiplier');
    if (buyCashMultiplier) {
        buyCashMultiplier.addEventListener('click', function() {
            const cost = gameState.cashUpgradeCosts.multiplier;
            if (gameState.cash >= cost) {
                gameState.cash -= cost;
                gameState.cashUpgradeLevels.multiplier++;
                gameState.cashUpgradeCosts.multiplier *= 2;
                updateDisplay();
                saveData();
                showNotification('🔢 Multiplier yangilandi!', 'success');
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
    const navButtons = document.querySelectorAll('.game-footer .nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-tab');
            if (target === 'game') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (target === 'chat') {
                toggleChat();
            } else if (target === 'missions') {
                openModalById('missionsModal');
            } else if (target === 'settings') {
                showSettingsModal();
            }
        });
    });

    setupAuthentication();
    setupStaticModalControls();
    setupSettingsEvents();
    setupChatEvents();
    setupAdSystem();
    
    // Start game loops
    startGameLoops();
    
    // Add styles
    addWorkingStyles();

    initOnlineServices()
        .catch(error => console.warn('⚠️ Online services fallback to local mode:', error))
        .finally(() => {
            updateDisplay();
            loadChatMessages();
            refreshLeaderboard();
        });

    window.addEventListener('beforeunload', () => {
        if (supabaseClient && gameState.username) {
            supabaseClient
                .from('players')
                .update({ is_online: false, last_seen: new Date().toISOString() })
                .eq('username', gameState.username);
        }
    });
    
    console.log('✅ Setup complete - ZINOX GAMES 100% TAYYOR!');
});

// Load saved data from localStorage
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

async function initOnlineServices() {
    initializeSupabaseClient();
    if (!supabaseClient) {
        return;
    }

    await syncCurrentSessionFromSupabase();
    setupRealtimeChat();
    setupRealtimeLeaderboard();
}

function initializeSupabaseClient() {
    if (supabaseClient || !window.supabase?.createClient) {
        return;
    }

    supabaseClient = window.supabase.createClient(
        ONLINE_CONFIG.supabaseUrl,
        ONLINE_CONFIG.supabaseAnonKey
    );
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

function buildPlayerPayload() {
    return {
        username: gameState.username,
        phone: gameState.phone || null,
        telegram: gameState.telegram || null,
        zinox_tokens: Math.floor(gameState.zinoxTokens),
        cash_balance: Math.floor(gameState.cash),
        tap_power: 1 + gameState.cashUpgradeLevels.tapPower,
        multiplier_level: 1 + gameState.cashUpgradeLevels.multiplier,
        total_clicks: Math.floor(gameState.zinoxTokens),
        referral_code: gameState.referralCode || createReferralCode(),
        is_online: true,
        last_seen: new Date().toISOString()
    };
}

async function syncCurrentSessionFromSupabase() {
    if (!supabaseClient || !gameState.phone) {
        return;
    }

    const { data, error } = await supabaseClient
        .from('players')
        .select('*')
        .eq('phone', gameState.phone)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        await upsertPlayerToSupabase();
        return;
    }

    gameState.username = data.username || gameState.username;
    gameState.phone = data.phone || gameState.phone;
    gameState.telegram = data.telegram || gameState.telegram || '';
    gameState.zinoxTokens = Number(data.zinox_tokens || 0);
    gameState.cash = Number(data.cash_balance || 0);
    gameState.joinedAt = data.created_at || gameState.joinedAt || new Date().toISOString();
    gameState.referralCode = data.referral_code || gameState.referralCode || createReferralCode();
    gameState.isAuthenticated = true;
    updateDisplay();
}

async function upsertPlayerToSupabase(extraFields = {}) {
    if (!supabaseClient || !gameState.username) {
        return null;
    }

    const payload = {
        ...buildPlayerPayload(),
        ...extraFields
    };

    const { data, error } = await supabaseClient
        .from('players')
        .upsert(payload, { onConflict: 'username' })
        .select()
        .single();

    if (error) {
        throw error;
    }

    lastRemoteSyncAt = Date.now();
    if (data?.created_at) {
        gameState.joinedAt = data.created_at;
    }
    return data;
}

// Save data to localStorage
function saveData() {
    try {
        const stateToSave = {
            zinoxTokens: gameState.zinoxTokens,
            cash: gameState.cash,
            username: gameState.username,
            isAuthenticated: gameState.isAuthenticated,
            soundEnabled: gameState.soundEnabled,
            vibrationEnabled: gameState.vibrationEnabled,
            phone: gameState.phone,
            telegram: gameState.telegram,
            joinedAt: gameState.joinedAt,
            referralCode: gameState.referralCode,
            energy: gameState.energy,
            cashUpgradeCosts: gameState.cashUpgradeCosts,
            cashUpgradeLevels: gameState.cashUpgradeLevels,
            turboMode: gameState.turboMode,
            adViewCount: gameState.adViewCount,
            chatMessages: gameState.chatMessages,
            isChatOpen: gameState.isChatOpen,
            chatLastUpdated: gameState.chatLastUpdated,
            lastSaveTime: Date.now()
        };
        
        localStorage.setItem('zinoxGameState', JSON.stringify(stateToSave));
        persistCurrentUser();
    } catch (error) {
        console.log('⚠️ Could not save data');
    }
}

// Update display
function updateDisplay() {
    // Update tokens
    const tokenDisplay = document.getElementById('zinoxAmount');
    if (tokenDisplay) {
        tokenDisplay.textContent = Math.floor(gameState.zinoxTokens).toLocaleString();
    }
    
    // Update cash display - fix undefined issue
    const cashDisplay = document.getElementById('cashAmount');
    if (cashDisplay) {
        const cashAmount = gameState.cash || 0;
        cashDisplay.textContent = '$' + cashAmount.toLocaleString();
    }
    
    // Update energy
    const energyDisplay = document.getElementById('energyText');
    if (energyDisplay) {
        energyDisplay.textContent = gameState.energy + '/' + gameState.maxEnergy;
    }
    
    // Update username
    const usernameDisplay = document.getElementById('username');
    if (usernameDisplay) {
        usernameDisplay.textContent = gameState.username;
    }

    const profileNickname = document.getElementById('profileNickname');
    const profileUserId = document.getElementById('profileUserId');
    const profileTokens = document.getElementById('profileTokens');
    const profileClicks = document.getElementById('profileClicks');
    const profilePhone = document.getElementById('profilePhone');
    const profileTelegram = document.getElementById('profileTelegram');
    const profileJoinDate = document.getElementById('profileJoinDate');
    const profileReferrals = document.getElementById('profileReferrals');
    const referralCode = document.getElementById('referralCode');

    if (profileNickname) profileNickname.textContent = gameState.username;
    if (profileUserId) profileUserId.textContent = gameState.phone || 'LOCAL';
    if (profileTokens) profileTokens.textContent = Math.floor(gameState.zinoxTokens).toLocaleString();
    if (profileClicks) profileClicks.textContent = Math.floor(gameState.zinoxTokens).toLocaleString();
    if (profilePhone) profilePhone.textContent = gameState.phone || 'Kiritilmagan';
    if (profileTelegram) profileTelegram.textContent = gameState.telegram || 'Kiritilmagan';
    if (profileJoinDate) profileJoinDate.textContent = gameState.joinedAt
        ? new Date(gameState.joinedAt).toLocaleDateString('uz-UZ')
        : 'Bugun';
    if (profileReferrals) profileReferrals.textContent = String(gameState.adViewCount || 0);
    if (referralCode) referralCode.textContent = gameState.referralCode || 'GUEST123';
    
    // Update upgrade displays
    updateUpgradeDisplays();
}

// Update upgrade displays
function updateUpgradeDisplays() {
    // Cash tap power display
    const cashTapPowerLevel = document.getElementById('cashTapPowerLevel');
    if (cashTapPowerLevel) {
        cashTapPowerLevel.textContent = 'Level ' + gameState.cashUpgradeLevels.tapPower;
    }
    
    const cashTapCost = document.getElementById('cashTapCost');
    if (cashTapCost) {
        cashTapCost.textContent = '$' + gameState.cashUpgradeCosts.tapPower.toLocaleString();
    }
    
    // Cash multiplier display
    const cashMultiplierLevel = document.getElementById('cashMultiplierLevel');
    if (cashMultiplierLevel) {
        cashMultiplierLevel.textContent = 'Level ' + gameState.cashUpgradeLevels.multiplier;
    }
    
    const cashMultiplierCost = document.getElementById('cashMultiplierCost');
    if (cashMultiplierCost) {
        cashMultiplierCost.textContent = '$' + gameState.cashUpgradeCosts.multiplier.toLocaleString();
    }
    
    // Turbo mode display
    const turboCost = document.getElementById('turboCost');
    if (turboCost) {
        const turboCostAmount = gameState.cashUpgradeCosts.turbo || 5;
        turboCost.textContent = '$' + turboCostAmount;
    }
    
    // Update turbo button state
    const buyTurbo = document.getElementById('buyTurbo');
    if (buyTurbo) {
        if (gameState.turboMode.isActive) {
            buyTurbo.textContent = '🚀 AKTIV';
            buyTurbo.disabled = true;
        } else {
            buyTurbo.textContent = '🚀 TURBO MODE';
            buyTurbo.disabled = false;
        }
    }
    
    // Update turbo display
    updateTurboDisplay();
}

// Update turbo display
function updateTurboDisplay() {
    const turboDisplay = document.getElementById('turboDisplay');
    if (turboDisplay) {
        if (gameState.turboMode.isActive) {
            const remainingTime = Math.ceil((gameState.turboMode.endTime - Date.now()) / 1000);
            turboDisplay.textContent = '🚀 TURBO MODE: ' + remainingTime + 's';
            turboDisplay.style.display = 'block';
        } else {
            turboDisplay.style.display = 'none';
        }
    }
}

// Start game loops
function startGameLoops() {
    // Energy regeneration
    setInterval(() => {
        if (gameState.energy < gameState.maxEnergy && !gameState.turboMode.isActive) {
            const now = Date.now();
            const timeDiff = now - gameState.lastEnergyRegen;
            const energyToRegen = Math.floor(timeDiff / (1000 / gameState.energyRegenRate));
            
            if (energyToRegen > 0) {
                gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + energyToRegen);
                gameState.lastEnergyRegen = now;
                updateDisplay();
                saveData();
            }
        }
    }, 100);
    
    // Turbo mode timer
    setInterval(() => {
        if (gameState.turboMode.isActive && Date.now() >= gameState.turboMode.endTime) {
            gameState.turboMode.isActive = false;
            gameState.turboMode.endTime = 0;
            updateDisplay();
            saveData();
            showNotification('🚀 Turbo mode tugadi!', 'info');
        }
    }, 100);
}

// Activate turbo mode
function activateTurboMode() {
    gameState.turboMode.isActive = true;
    gameState.turboMode.endTime = Date.now() + gameState.turboMode.duration;
    gameState.energy = gameState.maxEnergy; // Fill energy for visual effect
}

// Play tap sound
function playTapSound(isTurbo = false) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = isTurbo ? 800 : 600;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + (isTurbo ? 0.15 : 0.1));
    } catch (error) {
        console.log('🔇 Sound not available');
    }
}

// Create token effect
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

// Show notification
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
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Toggle chat
function toggleChat() {
    gameState.isChatOpen = !gameState.isChatOpen;

    if (gameState.isChatOpen) {
        openModalById('chatModal');
        loadChatMessages();
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.focus();
        }
    } else {
        closeModalById('chatModal');
    }
}

// Load chat messages
async function loadChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';

        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('chat_messages')
                    .select('player_username, message, created_at')
                    .order('created_at', { ascending: true })
                    .limit(50);

                if (error) {
                    throw error;
                }

                data.forEach(msg => addChatMessage(msg.player_username || 'Guest', msg.message, false, msg.created_at));
                return;
            } catch (error) {
                console.warn('⚠️ Realtime chat load failed, using local cache:', error);
            }
        }

        addChatMessage('Bot', '👋 Salom! Zinox Games chatiga xush kelibsiz!', true);
        gameState.chatMessages.forEach(msg => {
            addChatMessage(msg.username, msg.message, msg.isBot, msg.created_at || msg.timestamp);
        });
    }
}

// Add chat message
function addChatMessage(username, message, isBot = false, createdAt = null) {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isBot ? 'chat-system-message' : 'chat-message';
        const time = createdAt
            ? new Date(createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
            : '';
        messageDiv.innerHTML = `
            <strong>${escapeHtml(username)}:</strong> ${escapeHtml(message)} ${time ? `<span style="opacity:.7;font-size:12px;">${time}</span>` : ''}
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Send chat message
async function sendChatMessage() {
    if (!gameState.isAuthenticated) {
        showNotification('⚠️ Chatdan foydalanish uchun avval tizimga kiring!', 'warning');
        return;
    }
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        const message = chatInput.value.trim();
        if (message) {
            const createdAt = new Date().toISOString();
            const chatEntry = {
                username: gameState.username,
                message,
                timestamp: Date.now(),
                created_at: createdAt
            };

            if (supabaseClient) {
                const moderation = await moderateChatMessage(message);
                if (!moderation.allowed) {
                    showNotification(moderation.reason || '⚠️ Xabar yuborilmadi', 'warning');
                    return;
                }

                const { error } = await supabaseClient
                    .from('chat_messages')
                    .insert({
                        player_username: gameState.username,
                        message,
                        created_at: createdAt
                    });

                if (error) {
                    throw error;
                }
            } else {
                addChatMessage(gameState.username, message, false, createdAt);
            }

            gameState.chatMessages.push(chatEntry);
            if (gameState.chatMessages.length > 50) {
                gameState.chatMessages.shift();
            }
            chatInput.value = '';
            saveData();
        }
    }
}

// Show settings modal
function showSettingsModal() {
    const usernameInput = document.getElementById('usernameInput');
    const soundToggle = document.getElementById('soundToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');

    if (usernameInput) {
        usernameInput.value = gameState.username;
    }
    if (soundToggle) {
        soundToggle.checked = gameState.soundEnabled;
    }
    if (vibrationToggle) {
        vibrationToggle.checked = gameState.vibrationEnabled;
    }

    openModalById('settingsModal');
}

function setupAuthentication() {
    const closeAuth = document.getElementById('closeAuth');
    const authSwitchBtn = document.getElementById('authSwitchBtn');
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');

    if (closeAuth) {
        closeAuth.addEventListener('click', () => {
            if (!gameState.isAuthenticated) {
                showNotification('⚠️ Avval tizimga kiring yoki ro‘yxatdan o‘ting', 'warning');
                return;
            }
            closeModalById('authModal');
        });
    }

    if (authSwitchBtn) {
        authSwitchBtn.addEventListener('click', toggleAuthMode);
    }

    if (signInBtn) {
        signInBtn.addEventListener('click', () => void authenticateUser('signIn'));
    }

    if (signUpBtn) {
        signUpBtn.addEventListener('click', () => void authenticateUser('signUp'));
    }

    if (!gameState.isAuthenticated) {
        openModalById('authModal');
    }
}

function setupStaticModalControls() {
    const modalPairs = [
        ['closeLeaderboard', 'leaderboardModal'],
        ['closeReferral', 'referralModal'],
        ['closeCashShop', 'cashShopModal'],
        ['closeProfile', 'profileModal'],
        ['closeMissions', 'missionsModal'],
        ['closeDonate', 'donateModal'],
        ['closeChat', 'chatModal'],
        ['closeSettings', 'settingsModal']
    ];

    modalPairs.forEach(([buttonId, modalId]) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => closeModalById(modalId));
        }
    });
}

function setupSettingsEvents() {
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (!saveSettingsBtn) {
        return;
    }

    saveSettingsBtn.addEventListener('click', function() {
        const soundToggle = document.getElementById('soundToggle');
        const vibrationToggle = document.getElementById('vibrationToggle');
        const usernameInput = document.getElementById('usernameInput');

        gameState.soundEnabled = Boolean(soundToggle?.checked);
        gameState.vibrationEnabled = Boolean(vibrationToggle?.checked);

        if (usernameInput && usernameInput.value.trim()) {
            gameState.username = usernameInput.value.trim();
        }

        saveData();
        updateDisplay();
        closeModalById('settingsModal');
        showNotification('✅ Sozlamalar saqlandi!', 'success');
    });
}

function setupChatEvents() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendChatMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}

function setupRealtimeChat() {
    if (!supabaseClient || chatSubscription) {
        return;
    }

    chatSubscription = supabaseClient
        .channel('zinox-chat')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
        }, payload => {
            const message = payload.new;
            if (!message) {
                return;
            }

            const exists = gameState.chatMessages.some(item =>
                item.username === message.player_username &&
                item.message === message.message &&
                item.created_at === message.created_at
            );

            if (!exists) {
                gameState.chatMessages.push({
                    username: message.player_username,
                    message: message.message,
                    created_at: message.created_at
                });
                if (gameState.chatMessages.length > 50) {
                    gameState.chatMessages.shift();
                }
            }

            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages && gameState.isChatOpen) {
                addChatMessage(message.player_username || 'Guest', message.message, false, message.created_at);
            }
        })
        .subscribe();
}

function setupRealtimeLeaderboard() {
    if (!supabaseClient || leaderboardSubscription) {
        return;
    }

    leaderboardSubscription = supabaseClient
        .channel('zinox-leaderboard')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'players'
        }, () => {
            refreshLeaderboard();
        })
        .subscribe();
}

async function refreshLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    const onlineCount = document.getElementById('onlineCount');

    if (!supabaseClient) {
        if (leaderboardList) {
            leaderboardList.innerHTML = `
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">#1</span>
                    <span class="leaderboard-name">${escapeHtml(gameState.username)}</span>
                    <span class="leaderboard-score">${Math.floor(gameState.zinoxTokens).toLocaleString()} 💎</span>
                </div>
            `;
        }
        if (onlineCount) {
            onlineCount.textContent = gameState.isAuthenticated ? '1' : '0';
        }
        return;
    }

    try {
        const [{ data: players, error }, { count, error: countError }] = await Promise.all([
            supabaseClient
                .from('players')
                .select('username, zinox_tokens')
                .order('zinox_tokens', { ascending: false })
                .limit(20),
            supabaseClient
                .from('players')
                .select('*', { count: 'exact', head: true })
                .eq('is_online', true)
        ]);

        if (error) throw error;
        if (countError) throw countError;

        if (leaderboardList) {
            leaderboardList.innerHTML = players.map((player, index) => `
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span class="leaderboard-name">${escapeHtml(player.username || 'Guest')}</span>
                    <span class="leaderboard-score">${Math.floor(player.zinox_tokens || 0).toLocaleString()} 💎</span>
                </div>
            `).join('');
        }

        if (onlineCount) {
            onlineCount.textContent = String(count || 0);
        }
    } catch (error) {
        console.warn('⚠️ Leaderboard refresh failed:', error);
    }
}

async function moderateChatMessage(message) {
    try {
        const response = await fetch('/api/groq-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'chat_moderation',
                message,
                username: gameState.username
            })
        });

        if (!response.ok) {
            return { allowed: true };
        }

        return await response.json();
    } catch (error) {
        return { allowed: true };
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function setupAdSystem() {
    const adSpace = document.getElementById('adSpace');
    const skipAdBtn = document.getElementById('skipAdBtn');

    if (adSpace) {
        adSpace.addEventListener('click', () => startAdExperience());
    }

    if (skipAdBtn) {
        skipAdBtn.addEventListener('click', finishAdExperience);
    }
}

function toggleAuthMode() {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const authTitle = document.getElementById('authTitle');
    const authSwitchBtn = document.getElementById('authSwitchBtn');
    const authSwitchText = document.getElementById('authSwitchText');
    const showingSignIn = signInForm && signInForm.style.display !== 'none';

    if (!signInForm || !signUpForm || !authTitle || !authSwitchBtn || !authSwitchText) {
        return;
    }

    signInForm.style.display = showingSignIn ? 'none' : 'block';
    signUpForm.style.display = showingSignIn ? 'block' : 'none';
    authTitle.textContent = showingSignIn ? "📝 RO'YXATDAN O'TISH" : '🔐 KIRISH';
    authSwitchText.textContent = showingSignIn ? 'Hisobingiz bormi?' : "Hisobingiz yo'qmi?";
    authSwitchBtn.textContent = showingSignIn ? 'Kirish' : "Ro'yxatdan o'tish";
}

async function authenticateUser(mode) {
    if (mode === 'signUp') {
        await handleSignUp();
        return;
    }

    await handleSignIn();
}

function openModalById(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModalById(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
}

function getStoredUsers() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
    } catch (error) {
        return [];
    }
}

function saveStoredUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function normalizePhone(phone) {
    return String(phone || '').replace(/\s+/g, '').trim();
}

function validatePhone(phone) {
    return /^\+998\d{9}$/.test(normalizePhone(phone));
}

function validateTelegram(value) {
    if (!value) {
        return true;
    }

    return /^@?[A-Za-z0-9_]{3,32}$/.test(value.trim());
}

function setCurrentSession(phone) {
    localStorage.setItem(STORAGE_KEYS.session, normalizePhone(phone));
}

function getCurrentSession() {
    return localStorage.getItem(STORAGE_KEYS.session) || '';
}

async function handleSignUp() {
    const nickname = document.getElementById('signUpNickname')?.value.trim() || '';
    const phone = normalizePhone(document.getElementById('signUpPhone')?.value);
    const telegramRaw = document.getElementById('signUpTelegram')?.value.trim() || '';
    const password = document.getElementById('signUpPassword')?.value || '';
    const confirm = document.getElementById('signUpPasswordConfirm')?.value || '';
    const telegram = telegramRaw ? (telegramRaw.startsWith('@') ? telegramRaw : `@${telegramRaw}`) : '';

    if (nickname.length < 3) {
        showNotification('⚠️ Nickname kamida 3 ta harfdan iborat bo‘lsin', 'warning');
        return;
    }
    if (!validatePhone(phone)) {
        showNotification('⚠️ Telefon raqamni +998XXXXXXXXX formatda kiriting', 'warning');
        return;
    }
    if (!validateTelegram(telegram)) {
        showNotification('⚠️ Telegram username noto‘g‘ri', 'warning');
        return;
    }
    if (password.length < 4) {
        showNotification('⚠️ Parol kamida 4 ta belgidan iborat bo‘lsin', 'warning');
        return;
    }
    if (password !== confirm) {
        showNotification('⚠️ Parollar mos emas', 'warning');
        return;
    }

    const users = getStoredUsers();
    if (users.some(user => normalizePhone(user.phone) === phone)) {
        showNotification('⚠️ Bu telefon raqam bilan hisob allaqachon mavjud', 'warning');
        return;
    }
    if (users.some(user => String(user.username || '').toLowerCase() === nickname.toLowerCase())) {
        showNotification('⚠️ Bu nickname band', 'warning');
        return;
    }

    const newUser = {
        username: nickname,
        phone,
        telegram,
        password,
        referralCode: createReferralCode(),
        createdAt: new Date().toISOString(),
        zinoxTokens: gameState.zinoxTokens,
        cash: gameState.cash,
        adViewCount: gameState.adViewCount
    };

    users.push(newUser);
    saveStoredUsers(users);
    setCurrentSession(phone);
    applyUserToGameState(newUser);
    gameState.referralCode = newUser.referralCode;

    if (supabaseClient) {
        try {
            await upsertPlayerToSupabase({
                phone,
                telegram,
                password_hash: await hashPassword(password),
                referral_code: newUser.referralCode
            });
        } catch (error) {
            console.warn('⚠️ Signup synced locally only:', error);
        }
    }

    closeModalById('authModal');
    updateDisplay();
    saveData();
    refreshLeaderboard();
    showNotification(`✅ Hisob yaratildi. Xush kelibsiz, ${nickname}!`, 'success');
}

async function handleSignIn() {
    const nickname = document.getElementById('signInNickname')?.value.trim() || '';
    const phone = normalizePhone(document.getElementById('signInPhone')?.value);
    const password = document.getElementById('signInPassword')?.value || '';

    if (!phone || !password) {
        showNotification('⚠️ Telefon raqam va parolni kiriting', 'warning');
        return;
    }

    const users = getStoredUsers();
    const matchedUser = users.find(user =>
        normalizePhone(user.phone) === phone &&
        user.password === password &&
        (!nickname || String(user.username || '').toLowerCase() === nickname.toLowerCase())
    );

    if (!matchedUser) {
        if (supabaseClient) {
            try {
                const passwordHash = await hashPassword(password);
                const { data, error } = await supabaseClient
                    .from('players')
                    .select('*')
                    .eq('phone', phone)
                    .eq('password_hash', passwordHash)
                    .maybeSingle();

                if (error) {
                    throw error;
                }

                if (data && (!nickname || String(data.username || '').toLowerCase() === nickname.toLowerCase())) {
                    const remoteUser = {
                        username: data.username,
                        phone: data.phone,
                        telegram: data.telegram,
                        password,
                        referralCode: data.referral_code,
                        createdAt: data.created_at,
                        zinoxTokens: Number(data.zinox_tokens || 0),
                        cash: Number(data.cash_balance || 0),
                        adViewCount: 0
                    };
                    users.push(remoteUser);
                    saveStoredUsers(users);
                    setCurrentSession(phone);
                    applyUserToGameState(remoteUser);
                    closeModalById('authModal');
                    updateDisplay();
                    saveData();
                    refreshLeaderboard();
                    showNotification(`👋 Qaytganingiz bilan, ${remoteUser.username}!`, 'success');
                    return;
                }
            } catch (error) {
                console.warn('⚠️ Remote login failed:', error);
            }
        }

        showNotification('❌ Login yoki parol noto‘g‘ri', 'warning');
        return;
    }

    setCurrentSession(phone);
    applyUserToGameState(matchedUser);
    closeModalById('authModal');
    updateDisplay();
    saveData();
    if (supabaseClient) {
        try {
            await upsertPlayerToSupabase({
                password_hash: matchedUser.password ? await hashPassword(matchedUser.password) : undefined
            });
        } catch (error) {
            console.warn('⚠️ Local user could not sync remotely:', error);
        }
    }
    refreshLeaderboard();
    showNotification(`👋 Qaytganingiz bilan, ${matchedUser.username}!`, 'success');
}

function applyUserToGameState(user) {
    gameState.username = user.username || 'Player';
    gameState.phone = normalizePhone(user.phone);
    gameState.telegram = user.telegram || '';
    gameState.joinedAt = user.createdAt || gameState.joinedAt || new Date().toISOString();
    gameState.referralCode = user.referralCode || gameState.referralCode || createReferralCode();
    gameState.isAuthenticated = true;
    gameState.zinoxTokens = Number.isFinite(user.zinoxTokens) ? user.zinoxTokens : gameState.zinoxTokens;
    gameState.cash = Number.isFinite(user.cash) ? user.cash : gameState.cash;
    gameState.adViewCount = Number.isFinite(user.adViewCount) ? user.adViewCount : gameState.adViewCount;
}

function persistCurrentUser() {
    if (!gameState.isAuthenticated || !gameState.phone) {
        return;
    }

    const users = getStoredUsers();
    const index = users.findIndex(user => normalizePhone(user.phone) === normalizePhone(gameState.phone));
    if (index === -1) {
        return;
    }

    users[index] = {
        ...users[index],
        username: gameState.username,
        phone: gameState.phone,
        telegram: gameState.telegram,
        referralCode: gameState.referralCode,
        zinoxTokens: gameState.zinoxTokens,
        cash: gameState.cash,
        adViewCount: gameState.adViewCount
    };
    saveStoredUsers(users);

    if (supabaseClient && Date.now() - lastRemoteSyncAt > 1500) {
        upsertPlayerToSupabase().catch(error => console.warn('⚠️ Remote save failed:', error));
    }
}

function restoreCurrentSession() {
    const currentPhone = getCurrentSession();
    if (!currentPhone) {
        return;
    }

    const user = getStoredUsers().find(item => normalizePhone(item.phone) === normalizePhone(currentPhone));
    if (!user) {
        localStorage.removeItem(STORAGE_KEYS.session);
        return;
    }

    applyUserToGameState(user);
}

function startAdExperience() {
    if (!gameState.isAuthenticated) {
        openModalById('authModal');
        showNotification('⚠️ Reklama mukofoti uchun avval tizimga kiring', 'warning');
        return;
    }

    if (gameState.adState.isRunning) {
        return;
    }

    const skipAdBtn = document.getElementById('skipAdBtn');
    if (skipAdBtn) {
        skipAdBtn.disabled = true;
    }

    gameState.adState.isRunning = true;
    gameState.adState.startedAt = Date.now();
    openModalById('adModal');
    renderAdCountdown(15);
    gameState.adState.timerId = window.setInterval(tickAdCountdown, 200);
    tickAdCountdown();
}

function tickAdCountdown() {
    const elapsed = Date.now() - gameState.adState.startedAt;
    const remainingMs = Math.max(0, gameState.adState.duration - elapsed);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    renderAdCountdown(remainingSeconds);

    if (remainingMs <= 0) {
        const skipAdBtn = document.getElementById('skipAdBtn');
        if (skipAdBtn) {
            skipAdBtn.disabled = false;
            skipAdBtn.textContent = `Mukofotni olish (+$${gameState.adReward})`;
        }
        if (gameState.adState.timerId) {
            clearInterval(gameState.adState.timerId);
            gameState.adState.timerId = null;
        }
        return;
    }
}

function renderAdCountdown(seconds) {
    const adTimer = document.getElementById('adTimer');
    const skipTimer = document.getElementById('skipTimer');

    if (adTimer) {
        adTimer.textContent = String(seconds);
    }
    if (skipTimer) {
        skipTimer.textContent = String(seconds);
    }
}

function finishAdExperience() {
    const skipAdBtn = document.getElementById('skipAdBtn');
    if (skipAdBtn && skipAdBtn.disabled) {
        return;
    }

    if (gameState.adState.timerId) {
        clearInterval(gameState.adState.timerId);
    }

    gameState.adState.isRunning = false;
    gameState.adState.timerId = null;
    gameState.cash += gameState.adReward;
    gameState.adViewCount += 1;
    updateDisplay();
    saveData();
    persistCurrentUser();
    closeModalById('adModal');

    if (skipAdBtn) {
        skipAdBtn.disabled = true;
        skipAdBtn.innerHTML = `Reklamani o'tkazish (<span id="skipTimer">15</span>)`;
    }
    renderAdCountdown(15);
    showNotification(`💰 Reklama tugadi, +$${gameState.adReward} berildi`, 'success');
}

// Working styles
function addWorkingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes tokenFloat {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .modal {
            display: none;
        }

        .modal.active {
            display: flex;
        }
        
        .modal-content {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #00ff88;
            border-radius: 15px;
            padding: 20px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-header h2 {
            color: #00ff88;
            margin: 0;
        }
        
        .close-btn {
            color: #ff4444;
            font-size: 24px;
            cursor: pointer;
            background: none;
            border: none;
        }
        
        .close-btn:hover {
            color: #ff6666;
        }
        
        .chat-messages {
            height: 300px;
            overflow-y: auto;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 10px;
            background: rgba(0, 0, 0, 0.3);
        }
        
        .chat-message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 8px;
            background: rgba(0, 255, 136, 0.1);
        }
        
        .chat-system-message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 8px;
            background: rgba(255, 255, 0, 0.1);
            color: #ffff00;
        }
        
        .chat-input {
            display: flex;
            gap: 10px;
        }
        
        .chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #333;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
        }
        
        .chat-send-btn {
            padding: 10px 20px;
            background: #00ff88;
            color: black;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .chat-send-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 255, 136, 0.3);
        }
        
        .settings-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
        }
        
        .setting-item label {
            color: white;
            font-weight: bold;
        }
        
        .setting-item input[type="text"] {
            padding: 8px;
            border: 1px solid #333;
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
        }
        
        .save-settings-btn {
            padding: 12px 24px;
            background: #00ff88;
            color: black;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
        }
        
        .save-settings-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 255, 136, 0.3);
        }
    `;
    document.head.appendChild(style);
    console.log('🎨 Final styles added - ZINOX GAMES 100% TAYYOR!');
}
