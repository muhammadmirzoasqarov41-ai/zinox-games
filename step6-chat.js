// STEP 6: Chat system bilan Zinox Games
console.log('🎮 Step 6: Zinox Games with chat system loading...');

// Game state with chat
const gameState = {
    zinoxTokens: 0,
    username: 'Guest',
    isAuthenticated: false,
    soundEnabled: true,
    vibrationEnabled: true,
    // Energy system (balanced for 1.5 month goal)
    energy: 50,
    maxEnergy: 50,
    energyRegenRate: 0.5, // 1 energy per 2 seconds
    lastEnergyRegen: Date.now(),
    // Upgrades system
    tapPower: 1,
    autoClickerLevel: 0,
    multiplierLevel: 1,
    comboMasterLevel: 0,
    // Upgrade costs (balanced for 1.5 month goal)
    upgradeCosts: {
        tapPower: 25,      // 25 tokens
        autoClicker: 50,   // 50 tokens  
        multiplier: 100,  // 100 tokens
        comboMaster: 250   // 250 tokens
    },
    // Auto-clicker
    autoClickerInterval: null,
    // Combo system
    comboSystem: {
        isActive: false,
        multiplier: 1,
        progress: 0,
        maxProgress: 100,
        comboTime: 3000, // 3 seconds base
        lastClickTime: 0,
        clicksInCombo: 0,
        maxComboMultiplier: 10
    },
    // Chat system
    chatMessages: [],
    isChatOpen: false,
    chatLastUpdated: Date.now()
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Step 6: DOM loaded');
    
    // Initialize Supabase and load game state (with timeout protection)
    Promise.race([
        initializeSupabase(),
        new Promise((resolve) => setTimeout(resolve, 5000)) // 5 second timeout
    ]).finally(() => {
        // Always hide loading indicator after initialization or timeout
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
            console.log('✅ Loading indicator hidden');
        }
        
        // Show auth modal
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'flex';
            console.log('✅ Auth modal shown');
        }
    }).then(() => {
        // Setup tap functionality with combo
        const tapArea = document.getElementById('tapArea');
        if (tapArea) {
            tapArea.addEventListener('click', function(event) {
                // Check energy
                if (gameState.energy <= 0) {
                    showNotification('⚡ Energy yo\'q! Kuting...', 'warning');
                    return;
                }
                
                // Consume energy
                gameState.energy = Math.max(0, gameState.energy - 1);
                
                // Handle combo system
                handleCombo();
                
                // Calculate tokens with upgrades and combo
                const baseTokens = gameState.tapPower * gameState.multiplierLevel;
                const comboMultiplier = gameState.comboSystem.multiplier;
                const tokensEarned = Math.floor(baseTokens * comboMultiplier);
                
                gameState.zinoxTokens += tokensEarned;
                
                updateDisplay();
                
                // Play tap sound with combo effect
                playTapSound(comboMultiplier > 1);
                
                // Create token effects
                const effectCount = Math.min(Math.max(1, Math.floor(comboMultiplier)), 8);
                for (let i = 0; i < effectCount; i++) {
                    setTimeout(() => {
                        createTokenEffect(
                            event.clientX + (Math.random() - 0.5) * 80,
                            event.clientY + (Math.random() - 0.5) * 80,
                            comboMultiplier > 1
                        );
                    }, i * 50);
                }
                
                // Vibration effect
                if (gameState.vibrationEnabled && navigator.vibrate) {
                    const vibrationPattern = comboMultiplier > 1 ? [50, 30, 50] : 50;
                    navigator.vibrate(vibrationPattern);
                    console.log('📳 Vibration triggered');
                }
                
                console.log('💎 Tokens earned:', tokensEarned, 'Combo:', comboMultiplier + 'x', 'Total:', gameState.zinoxTokens);
            });
            console.log('✅ Tap area with combo setup complete');
        } else {
            console.warn('⚠️ Tap area not found');
        }
        
        // Setup auth
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', function() {
                const username = document.getElementById('signInNickname')?.value || 'Player';
                gameState.username = username;
                gameState.isAuthenticated = true;
                
                // Hide auth modal
                if (authModal) {
                    authModal.style.display = 'none';
                }
                
                updateDisplay();
                console.log('✅ User authenticated:', username);
            });
            console.log('✅ Sign in button setup complete');
        } else {
            console.warn('⚠️ Sign in button not found');
        }
        
        // Setup upgrade buttons
        setupUpgradeButtons();
        
        // Setup dashboard navigation buttons
        setupDashboardButtons();
        
        // Setup chat system
        setupChatSystem();
        
        // Start energy regeneration
        startEnergyRegeneration();
        
        // Start combo timer
        startComboTimer();
        
        // Add CSS animations
        addEffectStyles();
        
        updateDisplay();
        console.log('✅ Step 6: Zinox Games with chat ready!');
    }).catch((error) => {
        console.error('❌ Error during game initialization:', error);
        // Still hide loading indicator even if there's an error
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    });
});

function setupChatSystem() {
    // Create chat modal
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
                        💬 Chatga xush kelibsiz! O'yinchilar bilan suhbat qiling.
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" placeholder="Xabar yozing..." maxlength="200" autocomplete="off" spellcheck="false">
                    <button class="chat-send-btn" id="chatSendBtn">📤</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(chatModal);
    
    // Setup chat input
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    if (chatInput && chatSendBtn) {
        // Enter key to send
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
        
        // Send button click
        chatSendBtn.addEventListener('click', sendChatMessage);
        
        console.log('✅ Chat input setup complete');
    }
    
    // Simulate some initial messages
    setTimeout(() => {
        addChatMessage('System', '💬 Chatga xush kelibsiz! O\'yin uchun omad!', 'system');
    }, 1000);
    
    setTimeout(() => {
        addChatMessage('Player1', '🎮 Salom hammaga! O\'yin qiziqarli ekan!', 'user');
    }, 2000);
    
    setTimeout(() => {
        addChatMessage('Player2', '🔥 Combo 10x qildim! Qoyil!', 'user');
    }, 3000);
    
    console.log('✅ Chat system setup complete');
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
            // Focus on input
            setTimeout(() => {
                document.getElementById('chatInput')?.focus();
            }, 100);
        }
        console.log('💬 Chat toggled:', gameState.isChatOpen);
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
    
    if (messageText.length === 0) {
        return;
    }
    
    // Add user message
    addChatMessage(gameState.username, messageText, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Simulate response
    setTimeout(() => {
        const responses = [
            '👍 Yaxshi!',
            '🎮 Qiziqarli!',
            '🔥 Combo qiling!',
            '💎 Tokens yig\'ing!',
            '⚡ Energy tekshiring!',
            '🎯 Missiyalarni bajaring!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage('Bot', randomResponse, 'bot');
    }, 1000 + Math.random() * 2000);
    
    console.log('💬 Chat message sent:', messageText);
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
    
    // Store message
    gameState.chatMessages.push({
        username,
        message,
        type,
        timestamp: Date.now()
    });
    
    // Limit messages to 50
    if (gameState.chatMessages.length > 50) {
        gameState.chatMessages.shift();
        const firstMessage = chatMessages.firstChild;
        if (firstMessage && firstMessage.className !== 'chat-system-message') {
            firstMessage.remove();
        }
    }
    
    console.log('💬 Chat message added:', username, '-', message);
}

function handleCombo() {
    const now = Date.now();
    const combo = gameState.comboSystem;
    
    // Check if within combo window
    const timeSinceLastClick = now - combo.lastClickTime;
    const comboWindow = combo.comboTime + (gameState.comboMasterLevel * 1000);
    
    if (timeSinceLastClick <= comboWindow && combo.lastClickTime > 0) {
        // Continue combo
        combo.isActive = true;
        combo.clicksInCombo++;
        combo.progress = Math.min(100, combo.progress + (100 / 10));
        
        // Only increase multiplier after 3 clicks
        if (combo.clicksInCombo >= 3) {
            combo.multiplier = Math.min(
                combo.maxComboMultiplier,
                1 + Math.floor(combo.clicksInCombo / 3)
            );
        }
        
        console.log('🔥 Combo continued! Multiplier:', combo.multiplier + 'x', 'Progress:', combo.progress);
    } else {
        // Start new combo
        combo.isActive = true;
        combo.clicksInCombo = 1;
        combo.progress = 10;
        combo.multiplier = 1;
        
        console.log('🔥 New combo started!');
    }
    
    combo.lastClickTime = now;
}

function startComboTimer() {
    setInterval(() => {
        const combo = gameState.comboSystem;
        const now = Date.now();
        const timeSinceLastClick = now - combo.lastClickTime;
        const comboWindow = combo.comboTime + (gameState.comboMasterLevel * 1000);
        
        if (combo.isActive && timeSinceLastClick > comboWindow) {
            // Reset combo
            combo.isActive = false;
            combo.multiplier = 1;
            combo.progress = 0;
            combo.clicksInCombo = 0;
            
            updateComboDisplay();
            console.log('⏰ Combo ended');
        }
        
        updateComboDisplay();
    }, 100);
}

function updateComboDisplay() {
    const comboDisplay = document.getElementById('comboDisplay');
    const comboMultiplier = document.getElementById('comboMultiplier');
    const comboProgress = document.getElementById('comboProgress');
    
    if (comboDisplay) {
        if (gameState.comboSystem.isActive) {
            comboDisplay.style.display = 'block';
            comboDisplay.textContent = '🔥 COMBO!';
        } else {
            comboDisplay.style.display = 'none';
        }
    }
    
    if (comboMultiplier) {
        comboMultiplier.textContent = 'x' + gameState.comboSystem.multiplier;
    }
    
    if (comboProgress) {
        comboProgress.style.width = gameState.comboSystem.progress + '%';
        
        if (gameState.comboSystem.progress > 80) {
            comboProgress.style.background = '#ff00ff';
        } else if (gameState.comboSystem.progress > 50) {
            comboProgress.style.background = '#ff8800';
        } else {
            comboProgress.style.background = '#00ff88';
        }
    }
}

function setupUpgradeButtons() {
    // Tap Power Upgrade
    const buyTapPower = document.getElementById('buyTapPower');
    if (buyTapPower) {
        buyTapPower.addEventListener('click', function() {
            const cost = gameState.upgradeCosts.tapPower;
            if (gameState.zinoxTokens >= cost) {
                gameState.zinoxTokens -= cost;
                gameState.tapPower++;
                gameState.upgradeCosts.tapPower = Math.floor(cost * 1.3);
                updateDisplay();
                showNotification('💪 Tap Power ko\'tarildi! Yangi quvvat: ' + gameState.tapPower, 'success');
                console.log('💪 Tap Power upgraded to:', gameState.tapPower);
            } else {
                showNotification('💎 Token yetarli emas! Kerak: ' + cost, 'warning');
            }
        });
        console.log('✅ Tap Power button setup');
    }
    
    // Auto-Clicker Upgrade
    const buyAutoClicker = document.getElementById('buyAutoClicker');
    if (buyAutoClicker) {
        buyAutoClicker.addEventListener('click', function() {
            const cost = gameState.upgradeCosts.autoClicker;
            if (gameState.zinoxTokens >= cost) {
                gameState.zinoxTokens -= cost;
                gameState.autoClickerLevel++;
                gameState.upgradeCosts.autoClicker = Math.floor(cost * 1.5);
                startAutoClicker();
                updateDisplay();
                showNotification('🤖 Auto-Clicker ko\'tarildi! Level: ' + gameState.autoClickerLevel, 'success');
                console.log('🤖 Auto-Clicker upgraded to level:', gameState.autoClickerLevel);
            } else {
                showNotification('💎 Token yetarli emas! Kerak: ' + cost, 'warning');
            }
        });
        console.log('✅ Auto-Clicker button setup');
    }
    
    // Multiplier Upgrade
    const buyMultiplier = document.getElementById('buyMultiplier');
    if (buyMultiplier) {
        buyMultiplier.addEventListener('click', function() {
            const cost = gameState.upgradeCosts.multiplier;
            if (gameState.zinoxTokens >= cost) {
                gameState.zinoxTokens -= cost;
                gameState.multiplierLevel++;
                gameState.upgradeCosts.multiplier = Math.floor(cost * 1.6);
                updateDisplay();
                showNotification('✨ Multiplier ko\'tarildi! Yangi ko\'paytuvchi: x' + gameState.multiplierLevel, 'success');
                console.log('✨ Multiplier upgraded to:', gameState.multiplierLevel);
            } else {
                showNotification('💎 Token yetarli emas! Kerak: ' + cost, 'warning');
            }
        });
        console.log('✅ Multiplier button setup');
    }
    
    // Combo Master Upgrade
    const buyComboMaster = document.getElementById('buyComboMaster');
    if (buyComboMaster) {
        buyComboMaster.addEventListener('click', function() {
            const cost = gameState.upgradeCosts.comboMaster;
            if (gameState.zinoxTokens >= cost) {
                gameState.zinoxTokens -= cost;
                gameState.comboMasterLevel++;
                gameState.upgradeCosts.comboMaster = Math.floor(cost * 1.8);
                updateDisplay();
                showNotification('🔥 Combo Master ko\'tarildi! Combo vaqti: ' + (3 + gameState.comboMasterLevel) + ' sekund', 'success');
                console.log('🔥 Combo Master upgraded to level:', gameState.comboMasterLevel);
            } else {
                showNotification('💎 Token yetarli emas! Kerak: ' + cost, 'warning');
            }
        });
        console.log('✅ Combo Master button setup');
    }
    
    console.log('✅ All upgrade buttons setup complete');
}

function startAutoClicker() {
    // Clear existing interval
    if (gameState.autoClickerInterval) {
        clearInterval(gameState.autoClickerInterval);
    }
    
    // Start new interval if level > 0
    if (gameState.autoClickerLevel > 0) {
        const clickRate = 1000 / gameState.autoClickerLevel;
        gameState.autoClickerInterval = setInterval(() => {
            if (gameState.energy > 0) {
                gameState.energy = Math.max(0, gameState.energy - 1);
                const tokensEarned = gameState.tapPower * gameState.multiplierLevel;
                gameState.zinoxTokens += tokensEarned;
                updateDisplay();
                console.log('🤖 Auto-click earned:', tokensEarned);
            }
        }, clickRate);
        console.log('🤖 Auto-clicker started with rate:', gameState.autoClickerLevel + '/sec');
    }
}

function updateDisplay() {
    // Update token display
    const tokenDisplay = document.getElementById('zinoxAmount');
    if (tokenDisplay) {
        tokenDisplay.textContent = gameState.zinoxTokens.toLocaleString();
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
    // Update tap power
    const tapPowerLevel = document.getElementById('tapPowerLevel');
    const tapCost = document.getElementById('tapCost');
    if (tapPowerLevel) tapPowerLevel.textContent = gameState.tapPower;
    if (tapCost) tapCost.textContent = gameState.upgradeCosts.tapPower;
    
    // Update auto-clicker
    const autoClickerLevel = document.getElementById('autoClickerLevel');
    const autoClickerCost = document.getElementById('autoClickerCost');
    if (autoClickerLevel) autoClickerLevel.textContent = gameState.autoClickerLevel;
    if (autoClickerCost) autoClickerCost.textContent = gameState.upgradeCosts.autoClicker;
    
    // Update multiplier
    const multiplierLevel = document.getElementById('multiplierLevel');
    const multiplierCost = document.getElementById('multiplierCost');
    if (multiplierLevel) multiplierLevel.textContent = 'x' + gameState.multiplierLevel;
    if (multiplierCost) multiplierCost.textContent = gameState.upgradeCosts.multiplier;
    
    // Update combo master
    const comboLevel = document.getElementById('comboLevel');
    const comboCost = document.getElementById('comboCost');
    if (comboLevel) comboLevel.textContent = gameState.comboMasterLevel;
    if (comboCost) comboCost.textContent = gameState.upgradeCosts.comboMaster;
}

function startEnergyRegeneration() {
    setInterval(() => {
        if (gameState.energy < gameState.maxEnergy) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + gameState.energyRegenRate);
            updateDisplay();
            console.log('⚡ Energy regenerated:', gameState.energy);
        }
    }, 2000);
    console.log('⚡ Energy regeneration started (0.5 energy per 2 seconds)');
}

function playTapSound(isCombo = false) {
    if (!gameState.soundEnabled) {
        return;
    }
    
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
        console.log('🔇 Sound not available:', error.message);
    }
}

function createTokenEffect(x, y, isCombo = false) {
    const token = document.createElement('div');
    token.innerHTML = isCombo ? '🔥' : '💎';
    token.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: ${isCombo ? '28px' : '24px'};
        z-index: 9999;
        pointer-events: none;
        animation: ${isCombo ? 'comboFloat' : 'tokenFloat'} 1.2s ease-out forwards;
        color: ${isCombo ? '#ff00ff' : '#00ff88'};
        text-shadow: 0 0 ${isCombo ? '15px' : '10px'} ${isCombo ? '#ff00ff' : '#00ff88'};
    `;
    
    document.body.appendChild(token);
    
    setTimeout(() => {
        token.remove();
    }, 1200);
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

function setupDashboardButtons() {
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
                    <button class="settings-btn" onclick="alert('Reyting tez kunda...')">🏆 Reytingni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>👤 Profil</h3>
                    <button class="settings-btn" onclick="alert('Profil tez kunda...')">👤 Profilni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>💎 Donat</h3>
                    <button class="settings-btn" onclick="alert('Donat tez kunda...')">💎 Donatni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>👥 Referal</h3>
                    <button class="settings-btn" onclick="alert('Referal tez kunda...')">👥 Referalni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>💰 Do'kon</h3>
                    <button class="settings-btn" onclick="alert('Do\'kon tez kunda...')">💰 Do'konni ochish</button>
                </div>
                <div class="settings-section">
                    <h3>🔊 Ovoz</h3>
                    <label class="settings-toggle">
                        <input type="checkbox" ${gameState.soundEnabled ? 'checked' : ''} onchange="gameState.soundEnabled = this.checked">
                        <span>Ovoz effektlari</span>
                    </label>
                </div>
                <div class="settings-section">
                    <h3>📳 Tebranish</h3>
                    <label class="settings-toggle">
                        <input type="checkbox" ${gameState.vibrationEnabled ? 'checked' : ''} onchange="gameState.vibrationEnabled = this.checked">
                        <span>Vibratsiya</span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(settingsModal);
    console.log('⚙️ Settings modal opened');
}

function addEffectStyles() {
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
    `;
    document.head.appendChild(style);
    console.log('🎨 Effect styles with chat added');
}

// Supabase initialization
let supabase = null;

async function initializeSupabase() {
    try {
        // Wait a bit for Supabase to load (in case CDN is slow)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if Supabase is available
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase not available, using localStorage');
            loadFromLocalStorage();
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
            loadFromLocalStorage();
            return;
        }
        
        console.log('✅ Supabase connection test passed');
        
        // Load saved game state
        await loadGameState();
        
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
    }
}

// Load game state from Supabase
async function loadGameState() {
    if (!supabase) {
        console.log('📦 Supabase not available, loading from localStorage');
        loadFromLocalStorage();
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
                loadFromLocalStorage();
                return;
            }
        } else if (data) {
            // Load saved state
            if (data.game_state && typeof data.game_state === 'object') {
                Object.assign(gameState, data.game_state);
                console.log('✅ Game state loaded from Supabase');
            } else {
                console.warn('⚠️ Invalid game state format, using localStorage');
                loadFromLocalStorage();
                return;
            }
        }
        
        updateDisplay();
        
    } catch (error) {
        console.error('❌ Error loading game state:', error);
        loadFromLocalStorage();
    }
}

// Save game state to Supabase
async function saveGameState() {
    if (!supabase) {
        saveToLocalStorage();
        return;
    }
    
    try {
        const userId = localStorage.getItem('zinoxUserId');
        if (!userId) return;
        
        const gameStateData = {
            user_id: userId,
            game_state: {
                zinoxTokens: gameState.zinoxTokens,
                username: gameState.username,
                isAuthenticated: gameState.isAuthenticated,
                energy: gameState.energy,
                tapPower: gameState.tapPower,
                autoClickerLevel: gameState.autoClickerLevel,
                multiplierLevel: gameState.multiplierLevel,
                comboMasterLevel: gameState.comboMasterLevel,
                upgradeCosts: gameState.upgradeCosts,
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
            saveToLocalStorage();
        } else {
            console.log('✅ Game state saved to Supabase');
        }
        
    } catch (error) {
        console.error('❌ Error saving game state:', error);
        saveToLocalStorage();
    }
}

// Fallback localStorage functions
function loadFromLocalStorage() {
    try {
        const savedState = localStorage.getItem('zinoxGameState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            Object.assign(gameState, parsed);
            console.log('✅ Game state loaded from localStorage');
        }
        updateDisplay();
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
    }
}

function saveToLocalStorage() {
    try {
        const stateToSave = {
            zinoxTokens: gameState.zinoxTokens,
            username: gameState.username,
            isAuthenticated: gameState.isAuthenticated,
            energy: gameState.energy,
            tapPower: gameState.tapPower,
            autoClickerLevel: gameState.autoClickerLevel,
            multiplierLevel: gameState.multiplierLevel,
            comboMasterLevel: gameState.comboMasterLevel,
            upgradeCosts: gameState.upgradeCosts,
            lastSaveTime: Date.now()
        };
        
        localStorage.setItem('zinoxGameState', JSON.stringify(stateToSave));
        console.log('✅ Game state saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

// Auto-save every 30 seconds
setInterval(() => {
    saveGameState();
}, 30000);

// Save on page unload
window.addEventListener('beforeunload', () => {
    saveGameState();
});

// Make toggleChat globally available
window.toggleChat = toggleChat;

console.log('📦 Step 6: Script with chat system loaded');
