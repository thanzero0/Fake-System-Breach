const output = document.getElementById('output');
const input = document.getElementById('commandInput');

let gameState = {
    currentLevel: 1,
    isScanning: false,
    targetFound: false,
    isDecrypting: false,
    lastScanResult: null
};

const levels = [
    {
        id: 1,
        target: "SECURITY_FIREWALL_v1.0",
        puzzle: "Complete the sequence: 2, 4, 8, 16, [?]",
        answer: "32",
        successMsg: "Firewall bypassed. Accessing sector 7."
    },
    {
        id: 2,
        target: "DATABASE_ENCRYPTION_LAYER",
        puzzle: "Complete the pattern: 1, 1, 2, 3, 5, [?]",
        answer: "8",
        successMsg: "Encryption cracked. Downloading data packets..."
    },
    {
        id: 3,
        target: "ROOT_KERNEL_ACCESS",
        puzzle: "Convert Binary 1101 to Decimal: [?]",
        answer: "13",
        successMsg: "ROOT ACCESS GRANTED. SYSTEM COMPROMISED."
    }
];

function printLine(text, type = '') {
    const line = document.createElement('div');
    line.className = 'line ' + type;
    line.innerHTML = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function handleCommand(cmd) {
    const cleanCmd = cmd.toLowerCase().trim();
    printLine(`<span class="prompt">root@system:~#</span> ${cmd}`);

    if (gameState.isDecrypting) {
        checkAnswer(cleanCmd);
        return;
    }

    switch (cleanCmd) {
        case 'help':
            printLine('AVAILABLE COMMANDS:');
            printLine(' - <span class="highlight">SCAN</span>: Search for nearby network targets');
            printLine(' - <span class="highlight">DECRYPT</span>: Attempt to crack found target');
            printLine(' - <span class="highlight">CLEAR</span>: Clear terminal history');
            printLine(' - <span class="highlight">HELP</span>: Show this menu');
            break;
        case 'scan':
            startScan();
            break;
        case 'decrypt':
            startDecrypt();
            break;
        case 'clear':
            output.innerHTML = '';
            break;
        case '':
            break;
        default:
            printLine(`Unknown command: '${cmd}'. Type 'HELP' for available commands.`, 'error');
    }
}

async function startScan() {
    if (gameState.isScanning) return;
    gameState.isScanning = true;
    
    printLine('INITIALIZING NETWORK SCAN...');
    
    // Simulate scan progress
    for (let i = 0; i <= 100; i += 20) {
        await new Promise(r => setTimeout(r, 400));
        printLine(`Scanning sector ${i}%...`);
    }

    if (gameState.currentLevel > levels.length) {
        printLine('NO NEW TARGETS FOUND. SYSTEM ALREADY BREACHED.', 'success');
    } else {
        const level = levels[gameState.currentLevel - 1];
        gameState.targetFound = true;
        gameState.lastScanResult = level.target;
        printLine(`TARGET IDENTIFIED: <span class="highlight">${level.target}</span>`, 'success');
        printLine('USE "DECRYPT" TO ATTEMPT ACCESS.');
    }
    
    gameState.isScanning = false;
}

function startDecrypt() {
    if (!gameState.targetFound) {
        printLine('ERROR: NO TARGET IDENTIFIED. RUN "SCAN" FIRST.', 'error');
        return;
    }

    const level = levels[gameState.currentLevel - 1];
    gameState.isDecrypting = true;
    printLine(`ATTEMPTING TO DECRYPT: ${level.target}...`);
    printLine('--------------------------------------------');
    printLine(`PUZZLE: ${level.puzzle}`);
    printLine('ENTER ACCESS CODE:');
}

function checkAnswer(answer) {
    const level = levels[gameState.currentLevel - 1];
    
    if (answer === level.answer) {
        printLine('ACCESS GRANTED!', 'success');
        printLine(level.successMsg, 'success');
        gameState.isDecrypting = false;
        gameState.targetFound = false;
        gameState.currentLevel++;
        
        if (gameState.currentLevel > levels.length) {
            printLine('--------------------------------------------');
            printLine('MISSION ACCOMPLISHED. SYSTEM FULLY CONTROLLED.', 'success');
            printLine('TYPE "RESTART" TO RESET MISSION.');
        } else {
            printLine('NEXT TARGET READY. RUN "SCAN" TO CONTINUE.');
        }
    } else if (answer === 'cancel' || answer === 'exit') {
        gameState.isDecrypting = false;
        printLine('DECRYPTION ABORTED.');
    } else {
        printLine('INVALID ACCESS CODE. ACCESS DENIED.', 'error');
        printLine('RE-ENTER CODE OR TYPE "CANCEL" TO ABORT:');
    }
}

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = input.value;
        handleCommand(cmd);
        input.value = '';
    }
});

// Restart functionality
function restartGame() {
    gameState = {
        currentLevel: 1,
        isScanning: false,
        targetFound: false,
        isDecrypting: false,
        lastScanResult: null
    };
    output.innerHTML = '';
    printLine('SYSTEM REBOOTED...');
    printLine('WELCOME, AGENT. TYPE "HELP" FOR COMMANDS.');
}

// Check for restart command in handleCommand
const originalHandleCommand = handleCommand;
handleCommand = function(cmd) {
    if (cmd.toLowerCase().trim() === 'restart') {
        restartGame();
    } else {
        originalHandleCommand(cmd);
    }
};
