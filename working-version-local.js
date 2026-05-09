// 🚀 ZINOX GAMES WORKING - LOCAL VERSION
// Minimal, working version with no issues
console.log('🚀 ZINOX GAMES WORKING - Local version loading...');

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
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            if (target === 'shop') {
                const shopSection = document.getElementById('shopSection');
                if (shopSection) {
                    shopSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (target === 'chat') {
                toggleChat();
            } else if (target === 'settings') {
                showSettingsModal();
            }
        });
    });
    
    // Setup authentication
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('usernameInput').value.trim();
            if (username) {
                gameState.username = username;
                gameState.isAuthenticated = true;
                const authModal = document.getElementById('authModal');
                if (authModal) {
                    authModal.style.display = 'none';
                }
                updateDisplay();
                saveData();
                showNotification('👋 Xush kelibsiz, ' + username + '!', 'success');
            }
        });
    }
    
    // Start game loops
    startGameLoops();
    
    // Add styles
    addWorkingStyles();
    
    console.log('✅ Setup complete');
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

// Save data to localStorage
function saveData() {
    try {
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

// Update display
function updateDisplay() {
    // Update tokens
    const tokenDisplay = document.getElementById('tokenAmount');
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
    const energyDisplay = document.getElementById('energyAmount');
    if (energyDisplay) {
        energyDisplay.textContent = gameState.energy + '/' + gameState.maxEnergy;
    }
    
    // Update username
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = gameState.username;
    }
    
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
        showChatModal();
    } else {
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.remove();
        }
    }
}

// Show chat modal
function showChatModal() {
    const chatModal = document.createElement('div');
    chatModal.id = 'chatModal';
    chatModal.className = 'modal';
    chatModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>💬 Chat</h2>
                <span class="close-btn" onclick="toggleChat()">&times;</span>
            </div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input">
                <input type="text" id="chatInput" placeholder="Xabar yozing...">
                <button class="chat-send-btn" onclick="sendChatMessage()">Yuborish</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(chatModal);
    
    // Load chat messages
    loadChatMessages();
    
    // Focus input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.focus();
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}

// Load chat messages
function loadChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        
        // Add bot welcome message
        addChatMessage('Bot', '👋 Salom! Zinox Games chatiga xush kelibsiz!', true);
        
        // Load previous messages
        gameState.chatMessages.forEach(msg => {
            addChatMessage(msg.username, msg.message, msg.isBot);
        });
    }
}

// Add chat message
function addChatMessage(username, message, isBot = false) {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isBot ? 'chat-system-message' : 'chat-message';
        messageDiv.innerHTML = `
            <strong>${username}:</strong> ${message}
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Send chat message
function sendChatMessage() {
    if (!gameState.isAuthenticated) {
        showNotification('⚠️ Chatdan foydalanish uchun avval tizimga kiring!', 'warning');
        return;
    }
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        const message = chatInput.value.trim();
        if (message) {
            // Add user message
            addChatMessage(gameState.username, message);
            
            // Save to game state
            gameState.chatMessages.push({
                username: gameState.username,
                message: message,
                timestamp: Date.now()
            });
            
            // Keep only last 50 messages
            if (gameState.chatMessages.length > 50) {
                gameState.chatMessages.shift();
            }
            
            // Clear input
            chatInput.value = '';
            
            // Save data
            saveData();
            
            // Simulate bot response
            setTimeout(() => {
                const botResponses = [
                    'Qiziqarli!',
                    'Ajoyib!',
                    'Shu yerda yaxshi o\'ynaysiz!',
                    'Davom eting!',
                    'Siz yaxshiroq bo\'laysiz!',
                    'Omadingiz yuqori bo\'lsin!',
                    'ZINOX POWER!'
                ];
                const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                addChatMessage('Bot', randomResponse, true);
            }, 1000);
        }
    }
}

// Show settings modal
function showSettingsModal() {
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>⚙️ Sozlamalar</h2>
                <span class="close-btn" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="settings-content">
                <div class="setting-item">
                    <label>Ovoz:</label>
                    <input type="checkbox" id="soundToggle" ${gameState.soundEnabled ? 'checked' : ''}>
                </div>
                <div class="setting-item">
                    <label>Vibratsiya:</label>
                    <input type="checkbox" id="vibrationToggle" ${gameState.vibrationEnabled ? 'checked' : ''}>
                </div>
                <div class="setting-item">
                    <button class="save-settings-btn" id="saveSettings">SAQLASH</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup save button
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            const soundToggle = document.getElementById('soundToggle');
            const vibrationToggle = document.getElementById('vibrationToggle');
            
            gameState.soundEnabled = soundToggle.checked;
            gameState.vibrationEnabled = vibrationToggle.checked;
            
            saveData();
            showNotification('✅ Sozlamalar saqlandi!', 'success');
            modal.remove();
        });
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
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
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
    console.log('🎨 Working styles added');
}
