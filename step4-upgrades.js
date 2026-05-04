// STEP 4: Upgrades system bilan Zinox Games
console.log('🎮 Step 4: Zinox Games with upgrades system loading...');

// Game state with upgrades
const gameState = {
    zinoxTokens: 0,
    username: 'Guest',
    isAuthenticated: false,
    soundEnabled: true,
    vibrationEnabled: true,
    // Energy system
    energy: 100,
    maxEnergy: 100,
    energyRegenRate: 1, // per second
    lastEnergyRegen: Date.now(),
    // Upgrades system
    tapPower: 1,
    autoClickerLevel: 0,
    multiplierLevel: 1,
    comboMasterLevel: 0,
    // Upgrade costs
    upgradeCosts: {
        tapPower: 50,
        autoClicker: 100,
        multiplier: 200,
        comboMaster: 500
    },
    // Auto-clicker
    autoClickerInterval: null
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Step 4: DOM loaded');
    
    // Hide loading indicator
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
    
    // Setup tap functionality with upgrades
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
            
            // Calculate tokens with upgrades
            const tokensEarned = gameState.tapPower * gameState.multiplierLevel;
            gameState.zinoxTokens += tokensEarned;
            
            updateDisplay();
            
            // Play tap sound
            playTapSound();
            
            // Create token effects
            for (let i = 0; i < Math.min(tokensEarned, 5); i++) {
                setTimeout(() => {
                    createTokenEffect(
                        event.clientX + (Math.random() - 0.5) * 50,
                        event.clientY + (Math.random() - 0.5) * 50
                    );
                }, i * 100);
            }
            
            // Vibration effect
            if (gameState.vibrationEnabled && navigator.vibrate) {
                navigator.vibrate(50);
                console.log('📳 Vibration triggered');
            }
            
            console.log('💎 Tokens earned:', tokensEarned, 'Total:', gameState.zinoxTokens, 'Energy:', gameState.energy);
        });
        console.log('✅ Tap area with upgrades setup complete');
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
    
    // Start energy regeneration
    startEnergyRegeneration();
    
    // Add CSS animations
    addEffectStyles();
    
    updateDisplay();
    console.log('✅ Step 4: Zinox Games with upgrades ready!');
});

function setupUpgradeButtons() {
    // Tap Power Upgrade
    const buyTapPower = document.getElementById('buyTapPower');
    if (buyTapPower) {
        buyTapPower.addEventListener('click', function() {
            const cost = gameState.upgradeCosts.tapPower;
            if (gameState.zinoxTokens >= cost) {
                gameState.zinoxTokens -= cost;
                gameState.tapPower++;
                gameState.upgradeCosts.tapPower = Math.floor(cost * 1.5);
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
                gameState.upgradeCosts.autoClicker = Math.floor(cost * 2);
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
                gameState.upgradeCosts.multiplier = Math.floor(cost * 1.8);
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
                gameState.upgradeCosts.comboMaster = Math.floor(cost * 2.5);
                updateDisplay();
                showNotification('🔥 Combo Master ko\'tarildi! Level: ' + gameState.comboMasterLevel, 'success');
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
        const clickRate = 1000 / gameState.autoClickerLevel; // clicks per second
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
        
        // Change color based on energy level
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
    }, 1000);
    console.log('⚡ Energy regeneration started');
}

function playTapSound() {
    if (!gameState.soundEnabled) {
        return;
    }
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('🔇 Sound not available:', error.message);
    }
}

function createTokenEffect(x, y) {
    const token = document.createElement('div');
    token.innerHTML = '💎';
    token.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: 24px;
        z-index: 9999;
        pointer-events: none;
        animation: tokenFloat 1s ease-out forwards;
        color: #00ff88;
        text-shadow: 0 0 10px #00ff88;
    `;
    
    document.body.appendChild(token);
    
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
                case 'leaderboard':
                    showNotification('🏆 Reyting tez kunda...', 'info');
                    break;
                case 'profile':
                    showNotification('👤 Profil tez kunda...', 'info');
                    break;
                case 'missions':
                    showNotification('🎯 Missiyalar tez kunda...', 'info');
                    break;
                case 'chat':
                    showNotification('💬 Chat tez kunda...', 'info');
                    break;
                case 'donate':
                    showNotification('💎 Donat tez kunda...', 'info');
                    break;
                case 'referral':
                    showNotification('👥 Referal tez kunda...', 'info');
                    break;
                case 'shop':
                    showNotification('💰 Do\'kon tez kunda...', 'info');
                    break;
            }
        });
    });
    
    console.log('✅ Dashboard buttons setup complete');
}

function addEffectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes tokenFloat {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
        
        @keyframes tapPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes upgradeGlow {
            0% { box-shadow: 0 0 5px #00ff88; }
            50% { box-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88; }
            100% { box-shadow: 0 0 5px #00ff88; }
        }
        
        #tapArea:active {
            animation: tapPulse 0.2s ease-out;
        }
        
        .energy-fill {
            transition: width 0.3s ease, background 0.3s ease;
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
    `;
    document.head.appendChild(style);
    console.log('🎨 Effect styles with upgrades added');
}

console.log('📦 Step 4: Script with upgrades system loaded');
