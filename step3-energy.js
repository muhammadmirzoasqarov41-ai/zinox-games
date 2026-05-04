// STEP 3: Energy system bilan Zinox Games
console.log('🎮 Step 3: Zinox Games with energy system loading...');

// Game state with energy
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
    lastEnergyRegen: Date.now()
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Step 3: DOM loaded');
    
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
    
    // Setup tap functionality with energy
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
            gameState.zinoxTokens++;
            updateDisplay();
            
            // Play tap sound
            playTapSound();
            
            // Create token effect
            createTokenEffect(event.clientX, event.clientY);
            
            // Vibration effect
            if (gameState.vibrationEnabled && navigator.vibrate) {
                navigator.vibrate(50);
                console.log('📳 Vibration triggered');
            }
            
            console.log('💎 Token earned:', gameState.zinoxTokens, 'Energy:', gameState.energy);
        });
        console.log('✅ Tap area with energy setup complete');
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
    
    // Setup dashboard navigation buttons
    setupDashboardButtons();
    
    // Start energy regeneration
    startEnergyRegeneration();
    
    // Add CSS animations
    addEffectStyles();
    
    updateDisplay();
    console.log('✅ Step 3: Zinox Games with energy ready!');
});

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
        console.log('⚡ Energy bar updated:', energyPercent + '%');
    } else {
        console.warn('⚠️ Energy fill element not found');
    }
    
    if (energyText) {
        energyText.textContent = `${gameState.energy}/${gameState.maxEnergy}`;
    }
}

function startEnergyRegeneration() {
    setInterval(() => {
        if (gameState.energy < gameState.maxEnergy) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + gameState.energyRegenRate);
            updateDisplay();
            console.log('⚡ Energy regenerated:', gameState.energy);
        }
    }, 1000); // Every second
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
        
        console.log('🔊 Tap sound played');
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
    
    // Remove after animation
    setTimeout(() => {
        token.remove();
    }, 1000);
    
    console.log('✨ Token effect created at:', x, y);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? '#ffaa00' : '#00ff88'};
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
    // Get all navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            console.log('🔄 Navigation to tab:', tab);
            
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Handle tab switching
            switch(tab) {
                case 'game':
                    console.log('🎮 Game tab selected');
                    break;
                case 'leaderboard':
                    console.log('🏆 Leaderboard tab selected');
                    showNotification('🏆 Reyting tez kunda...', 'info');
                    break;
                case 'profile':
                    console.log('👤 Profile tab selected');
                    showNotification('👤 Profil tez kunda...', 'info');
                    break;
                case 'missions':
                    console.log('🎯 Missions tab selected');
                    showNotification('🎯 Missiyalar tez kunda...', 'info');
                    break;
                case 'chat':
                    console.log('💬 Chat tab selected');
                    showNotification('💬 Chat tez kunda...', 'info');
                    break;
                case 'donate':
                    console.log('💎 Donate tab selected');
                    showNotification('💎 Donat tez kunda...', 'info');
                    break;
                case 'referral':
                    console.log('👥 Referral tab selected');
                    showNotification('👥 Referal tez kunda...', 'info');
                    break;
                case 'shop':
                    console.log('💰 Shop tab selected');
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
            0% {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) scale(1.5);
                opacity: 0;
            }
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
    `;
    document.head.appendChild(style);
    console.log('🎨 Effect styles with dashboard added');
}

console.log('📦 Step 3: Script with energy system loaded');
