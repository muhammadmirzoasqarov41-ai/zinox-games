// STEP 1: Eng asosiy ishlaydigan Zinox Games
console.log('🎮 Step 1: Basic Zinox Games loading...');

// Eng oddiy game state
const gameState = {
    zinoxTokens: 0,
    username: 'Guest',
    isAuthenticated: false
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Step 1: DOM loaded');
    
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
    
    // Setup basic tap functionality
    const tapArea = document.getElementById('tapArea');
    if (tapArea) {
        tapArea.addEventListener('click', function() {
            gameState.zinoxTokens++;
            updateDisplay();
            console.log('💎 Token earned:', gameState.zinoxTokens);
        });
        console.log('✅ Tap area setup complete');
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
    
    updateDisplay();
    console.log('✅ Step 1: Basic Zinox Games ready!');
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

console.log('📦 Step 1: Basic script loaded');
