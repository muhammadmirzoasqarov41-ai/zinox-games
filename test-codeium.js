// Test Codeium extension
// Codeium should suggest completions here

function testCodeium() {
    console.log("Codeium is working!");
    return "Codeium activated!";
}

// Another test
const testArray = [1, 2, 3, 4, 5];
testArray.forEach(item => {
    console.log(item);
});

// Test function with parameters
function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

// ZINOX GAMES test
function createTokenEffect(x, y, tokensEarned) {
    const token = document.createElement('div');
    token.className = 'token-effect';
    token.textContent = '+' + tokensEarned;
    token.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        color: #ffff00;
        font-size: 28px;
        font-weight: bold;
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
    `;
    document.body.appendChild(token);
    setTimeout(() => token.remove(), 1000);
}

console.log("Codeium test file loaded");
