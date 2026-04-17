const output = document.getElementById('output');
const input = document.getElementById('commandInput');

let gameState = {
    currentLevel: 1,
    isScanning: false,
    targetFound: false,
    isDecrypting: false,
    isEditing: false,
    editMode: 'command',
    editBuffer: [],
    editFilename: '',
    lastScanResult: null,
    // File System
    fs: {
        name: 'root',
        type: 'dir',
        children: {
            'home': { type: 'dir', children: { 'agent': { type: 'dir', children: {} } } },
            'sys': { type: 'dir', children: { 'boot.log': { type: 'file', content: 'Kernel initialized.\nSystem ready.' } } }
        }
    },
    currentPath: ['root'] // representing '/'
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
    const pathString = getPathString();
    printLine(`<span class="prompt">root@system:${pathString}#</span> ${cmd}`);

    if (gameState.isEditing) {
        handleEdInput(cmd);
        return;
    }

    if (gameState.isDecrypting) {
        checkAnswer(cleanCmd);
        return;
    }

    switch (cleanCmd) {
        case 'help':
            printLine('AVAILABLE COMMANDS:');
            printLine(' - <span class="highlight">SCAN</span>: Search for nearby network targets');
            printLine(' - <span class="highlight">DECRYPT</span>: Attempt to crack found target');
            printLine(' - <span class="highlight">LS</span>: List directory contents');
            printLine(' - <span class="highlight">CD [dir]</span>: Change directory');
            printLine(' - <span class="highlight">MKDIR [dir]</span>: Create directory');
            printLine(' - <span class="highlight">PWD</span>: Print working directory');
            printLine(' - <span class="highlight">ED [file]</span>: Open text editor');
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
        case 'ls':
            listDir();
            break;
        case 'pwd':
            printLine(getPathString());
            break;
        case 'ed':
            startEd('');
            break;
        default:
            if (cleanCmd.startsWith('ed ')) {
                startEd(cleanCmd.split(' ')[1]);
            } else if (cleanCmd.startsWith('cd ')) {
                changeDir(cleanCmd.split(' ')[1]);
            } else if (cleanCmd.startsWith('mkdir ')) {
                makeDir(cleanCmd.split(' ')[1]);
            } else {
                printLine(`Unknown command: '${cmd}'. Type 'HELP' for available commands.`, 'error');
            }
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

// --- ED EDITOR LOGIC ---

function startEd(filename) {
    if (!filename) {
        printLine('ERROR: FILENAME REQUIRED.', 'error');
        return;
    }
    
    gameState.isEditing = true;
    gameState.editMode = 'command';
    gameState.editFilename = filename;
    
    // Check if file exists to load content
    const currentDir = getCurrentDir();
    if (currentDir.children[filename] && currentDir.children[filename].type === 'file') {
        gameState.editBuffer = currentDir.children[filename].content.split('\n');
        printLine(`${gameState.editBuffer.join('\n').length}`);
    } else {
        gameState.editBuffer = [];
        printLine(`${filename}`);
    }
    
    updatePrompt('');
}

function handleEdInput(input) {
    if (gameState.editMode === 'input') {
        if (input === '.') {
            gameState.editMode = 'command';
            updatePrompt('');
        } else {
            gameState.editBuffer.push(input);
        }
        return;
    }

    // Command mode
    const cmd = input.trim();
    switch (cmd) {
        case 'a':
            gameState.editMode = 'input';
            updatePrompt('');
            break;
        case 'p':
            if (gameState.editBuffer.length === 0) {
                printLine('?');
            } else {
                gameState.editBuffer.forEach(line => printLine(line));
            }
            break;
        case 'n':
            if (gameState.editBuffer.length === 0) {
                printLine('?');
            } else {
                gameState.editBuffer.forEach((line, i) => printLine(`${i + 1}\t${line}`));
            }
            break;
        case 'w':
            saveFileToFS();
            break;
        case 'q':
            gameState.isEditing = false;
            updatePrompt(`root@system:${getPathString()}#`);
            break;
        case '':
            break;
        default:
            printLine('?');
    }
}

// --- FILE SYSTEM UTILITIES ---

function getCurrentDir() {
    let current = gameState.fs;
    for (let i = 1; i < gameState.currentPath.length; i++) {
        current = current.children[gameState.currentPath[i]];
    }
    return current;
}

function getPathString() {
    if (gameState.currentPath.length === 1) return '/';
    return '/' + gameState.currentPath.slice(1).join('/');
}

function listDir() {
    const currentDir = getCurrentDir();
    const children = Object.keys(currentDir.children);
    if (children.length === 0) return;
    
    children.sort().forEach(name => {
        const item = currentDir.children[name];
        if (item.type === 'dir') {
            printLine(`<span class="highlight">[DIR]</span> ${name}`);
        } else {
            printLine(name);
        }
    });
}

function changeDir(dirName) {
    if (!dirName || dirName === '/') {
        gameState.currentPath = ['root'];
    } else if (dirName === '..') {
        if (gameState.currentPath.length > 1) {
            gameState.currentPath.pop();
        }
    } else {
        const currentDir = getCurrentDir();
        if (currentDir.children[dirName] && currentDir.children[dirName].type === 'dir') {
            gameState.currentPath.push(dirName);
        } else {
            printLine(`cd: ${dirName}: No such directory`, 'error');
        }
    }
    updatePrompt(`root@system:${getPathString()}#`);
}

function makeDir(dirName) {
    if (!dirName) {
        printLine('mkdir: missing operand', 'error');
        return;
    }
    const currentDir = getCurrentDir();
    if (currentDir.children[dirName]) {
        printLine(`mkdir: cannot create directory '${dirName}': File exists`, 'error');
    } else {
        currentDir.children[dirName] = { type: 'dir', children: {} };
    }
}

function saveFileToFS() {
    const currentDir = getCurrentDir();
    const content = gameState.editBuffer.join('\n');
    currentDir.children[gameState.editFilename] = {
        type: 'file',
        content: content
    };
    printLine(`${content.length}`);
}

function updatePrompt(text) {
    const promptEl = document.querySelector('.prompt');
    promptEl.innerHTML = text;
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
        isEditing: false,
        editMode: 'command',
        editBuffer: [],
        editFilename: '',
        lastScanResult: null,
        fs: {
            name: 'root',
            type: 'dir',
            children: {
                'home': { type: 'dir', children: { 'agent': { type: 'dir', children: {} } } },
                'sys': { type: 'dir', children: { 'boot.log': { type: 'file', content: 'Kernel initialized.\nSystem ready.' } } }
            }
        },
        currentPath: ['root']
    };
    updatePrompt('root@system:/#');
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
