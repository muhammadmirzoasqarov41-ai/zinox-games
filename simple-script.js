// Simple Zinox Games - Minimal Working Version
console.log('🎮 Simple Zinox Games loading...');

// Simple game state
const gameState = {
    zinoxTokens: 0,
    cashBalance: 0,
    username: 'Guest',
    isAuthenticated: false
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 DOM loaded');
    
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Show auth modal properly
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'flex';
        authModal.style.justifyContent = 'center';
        authModal.style.alignItems = 'center';
        console.log('✅ Auth modal shown');
    }
    
    // Setup basic tap functionality
    const tapArea = document.getElementById('tapArea');
    if (tapArea) {
        tapArea.addEventListener('click', function() {
            gameState.zinoxTokens++;
            updateDisplay();
            
            // Play tap sound
            playTapSound();
            
            // Create token effect
            createTokenEffect(event.clientX, event.clientY);
            
            // Vibration effect
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            console.log('💎 Token earned:', gameState.zinoxTokens);
        });
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
    }
    
    updateDisplay();
    console.log('✅ Simple Zinox Games ready!');
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
        console.log('Sound not available');
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
}

// Add CSS animation for token effect
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
`;
document.head.appendChild(style);

console.log('📦 Simple script loaded');
