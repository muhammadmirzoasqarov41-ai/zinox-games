// STEP 2: Tanga effektlari va ovoz effektlari bilan Zinox Games
console.log('🎮 Step 2: Zinox Games with effects loading...');

// Eng oddiy game state
const gameState = {
    zinoxTokens: 0,
    username: 'Guest',
    isAuthenticated: false,
    soundEnabled: true,
    vibrationEnabled: true
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Step 2: DOM loaded');
    
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
    
    // Setup tap functionality with effects
    const tapArea = document.getElementById('tapArea');
    if (tapArea) {
        tapArea.addEventListener('click', function(event) {
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
            
            console.log('💎 Token earned:', gameState.zinoxTokens);
        });
        console.log('✅ Tap area with effects setup complete');
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
    
    // Add CSS animations
    addEffectStyles();
    
    updateDisplay();
    console.log('✅ Step 2: Zinox Games with effects ready!');
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
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
            }
        }
        
        #tapArea:active {
            animation: tapPulse 0.2s ease-out;
        }
    `;
    document.head.appendChild(style);
    console.log('🎨 Effect styles added');
}

console.log('📦 Step 2: Script with effects loaded');
