const funTimes = {
    '1:01': 'A tidy mirror time.',
    '1:11': 'Triple ones.',
    '1:21': 'Mirror time in the hour.',
    '1:31': 'Palindromic time.',
    '1:41': 'Palindromic time.',
    '1:51': 'Palindromic time.',
    '1:23': 'Counting up in order.',
    '2:02': 'A tidy mirror time.',
    '2:10': 'Counting down in order.',
    '2:12': 'Palindromic time.',
    '2:22': 'Triple twos.',
    '2:32': 'Palindromic time.',
    '2:42': 'Palindromic time.',
    '2:52': 'Palindromic time.',
    '2:34': 'Counting up in order.',
    '3:03': 'A tidy mirror time.',
    '3:13': 'Palindromic time.',
    '3:23': 'Palindromic time.',
    '3:33': 'Triple threes.',
    '3:43': 'Palindromic time.',
    '3:53': 'Palindromic time.',
    '3:21': 'Counting down in order.',
    '3:45': 'Counting up in order.',
    '4:04': 'A tidy mirror time.',
    '4:14': 'Palindromic time.',
    '4:24': 'Palindromic time.',
    '4:34': 'Palindromic time.',
    '4:44': 'Triple fours.',
    '4:54': 'Palindromic time.',
    '4:32': 'Counting down in order.',
    '4:56': 'Counting up in order.',
    '5:05': 'A tidy mirror time.',
    '5:15': 'Palindromic time.',
    '5:25': 'Palindromic time.',
    '5:35': 'Palindromic time.',
    '5:45': 'Palindromic time.',
    '5:43': 'Counting down in order.',
    '5:55': 'Triple fives.',
    '6:06': 'A tidy mirror time.',
    '6:16': 'Palindromic time.',
    '6:26': 'Palindromic time.',
    '6:36': 'Palindromic time.',
    '6:46': 'Palindromic time.',
    '6:56': 'Palindromic time.',
    '6:54': 'Counting down in order.',
    '7:07': 'A tidy mirror time.',
    '7:17': 'Palindromic time.',
    '7:27': 'Palindromic time.',
    '7:37': 'Palindromic time.',
    '7:47': 'Palindromic time.',
    '7:57': 'Palindromic time.',
    '8:08': 'A tidy mirror time.',
    '8:18': 'Palindromic time.',
    '8:28': 'Palindromic time.',
    '8:38': 'Palindromic time.',
    '8:48': 'Palindromic time.',
    '8:58': 'Palindromic time.',
    '9:09': 'A tidy mirror time.',
    '9:19': 'Palindromic time.',
    '9:29': 'Palindromic time.',
    '9:39': 'Palindromic time.',
    '9:49': 'Palindromic time.',
    '9:59': 'Palindromic time.',
    '10:01': 'A neat mirror across digits.',
    '10:10': 'Double digits on the clock.',
    '11:11': 'All ones. Make a wish.',
    '12:12': 'Double digits on the clock.',
    '12:21': 'Mirror time in the hour.',
    '12:34': 'A clean counting sequence.'
};

const debugEnabled = new URLSearchParams(window.location.search).has('debug');
document.querySelectorAll('.debug-only').forEach((element) => {
    element.hidden = !debugEnabled;
});

let debugTimeOverride = null;

function parseDebugTime(value) {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*([aApP][mM]))?$/);
    if (!match) {
        return null;
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3] ? match[3].toUpperCase() : null;

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
        return null;
    }

    return {
        hour,
        minute,
        period
    };
}

function updateTime() {
    const now = new Date();

    // Format time as H:MM (no leading zero for hour, no seconds)
    const hourInt = now.getHours();
    const minuteInt = now.getMinutes();

    const hour12Int = hourInt % 12 || 12;
    const period = hourInt >= 12 ? 'PM' : 'AM';

    const displayHour = debugTimeOverride ? debugTimeOverride.hour : hour12Int;
    const displayMinute = debugTimeOverride ? debugTimeOverride.minute : minuteInt;
    const displayPeriod = debugTimeOverride?.period || period;
    const displayMinutes = String(displayMinute).padStart(2, '0');
    const time12String = `${displayHour}:${displayMinutes} ${displayPeriod}`;
    const funTimeKey = `${displayHour}:${displayMinutes}`;
    
    // Format date
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', options);
    
    // Update the DOM
    document.getElementById('time-12').textContent = time12String;
    document.getElementById('date-12').textContent = dateString;

    const reasonText = funTimes[funTimeKey] || '';
    const reasonEl = document.getElementById('celebration-reason');
    const titleEl = document.getElementById('celebration-title');
    if (reasonEl) {
        reasonEl.textContent = reasonText;
        reasonEl.classList.toggle('is-active', Boolean(reasonText));
    }
    if (titleEl) {
        titleEl.classList.toggle('is-active', Boolean(reasonText));
    }

    autoCelebrationActive = Boolean(reasonText);
    updateCelebrationState();
}

let celebrationIntervalId = null;
let manualCelebrationActive = false;
let autoCelebrationActive = false;

function updateCelebrationState() {
    const shouldCelebrate = manualCelebrationActive || autoCelebrationActive;

    if (shouldCelebrate && celebrationIntervalId === null) {
        startCelebration();
    }

    if (!shouldCelebrate && celebrationIntervalId !== null) {
        stopCelebration();
    }
}

function spawnConfettiBatch(container) {
    const colors = ['#f94144', '#f3722c', '#f9c74f', '#43aa8b', '#577590', '#90be6d'];
    const pieceCount = 18;
    const fallMin = 4200;
    const fallMax = 6200;

    for (let i = 0; i < pieceCount; i += 1) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const xStart = Math.random() * 100;
        const fallDuration = Math.random() * (fallMax - fallMin) + fallMin;

        piece.style.left = `${xStart}vw`;
        piece.style.backgroundColor = colors[i % colors.length];
        piece.style.setProperty('--fall-duration', `${fallDuration}ms`);
        piece.style.width = `${6 + Math.random() * 4}px`;
        piece.style.height = `${10 + Math.random() * 6}px`;

        piece.addEventListener('animationend', () => {
            piece.remove();
        });

        container.appendChild(piece);
    }
}

function startCelebration() {
    const container = document.getElementById('confetti-container');
    if (!container || celebrationIntervalId !== null) {
        return;
    }

    spawnConfettiBatch(container);
    celebrationIntervalId = window.setInterval(() => {
        spawnConfettiBatch(container);
    }, 700);
}

function stopCelebration() {
    const container = document.getElementById('confetti-container');
    if (celebrationIntervalId === null) {
        return;
    }

    window.clearInterval(celebrationIntervalId);
    celebrationIntervalId = null;

    if (container) {
        container.innerHTML = '';
    }
}

// Update time immediately
updateTime();

// Update time every second
setInterval(updateTime, 1000);

const debugButton = document.getElementById('debug-celebrate');
if (debugButton) {
    debugButton.textContent = 'Start Celebration';
    debugButton.addEventListener('click', () => {
        manualCelebrationActive = !manualCelebrationActive;
        debugButton.textContent = manualCelebrationActive
            ? 'Stop Celebration'
            : 'Start Celebration';
        updateCelebrationState();
    });
}

const debugInput = document.getElementById('debug-time');
const debugWarp = document.getElementById('debug-warp');

function applyDebugTime() {
    if (!debugInput) {
        return;
    }

    debugTimeOverride = parseDebugTime(debugInput.value);
    updateTime();
}

if (debugWarp) {
    debugWarp.addEventListener('click', applyDebugTime);
}

if (debugInput) {
    debugInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            applyDebugTime();
        }
    });
}