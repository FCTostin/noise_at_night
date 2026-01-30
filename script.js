const sounds = [
    { id: 'Rain', name: 'Дощ', icon: 'icons/free-icon-rain-weather-cloud-outline-symbol-with-raindrops-lines-54456.png', audio: 'sounds/soft-rain-on-a-tile-roof-14515.mp3' },
    { id: 'Storm', name: 'Гроза', icon: 'icons/free-icon-winds-lines-weather-storm-55036.png', audio: 'sounds/rain-and-wind-chimes-314370.mp3' },
    { id: 'Wind', name: 'Вітер', icon: 'icons/free-icon-winds-lines-weather-symbol-55037.png', audio: 'sounds/soft-wind-316392.mp3' },
    { id: 'Forest', name: 'Ліс', icon: 'icons/free-icon-forest-1167380.png', audio: 'sounds/forest-wind-355613.mp3' },
    { id: 'Ocean', name: 'Океан', icon: 'icons/free-icon-weather-interface-symbol-of-a-semicircle-on-three-lines-perspective-54741.png', audio: 'sounds/ocean-waves-250310.mp3' },
    { id: 'Hurricane', name: 'Ураган', icon: 'icons/free-icon-wind-socket-outlined-symbol-54561.png', audio: 'sounds/rain-and-thunder-321270.mp3' },
    { id: 'Night', name: 'Ніч', icon: 'icons/free-icon-fog-at-night-weather-symbol-54523.png', audio: 'sounds/night-ambience-17064.mp3' },
    { id: 'Fire', name: 'Костер', icon: 'icons/free-icon-hot-interface-symbol-of-fire-flames-outline-54409.png', audio: 'sounds/crackling-fire-14759.mp3' },
    { id: 'Birds', name: 'Птахи', icon: 'icons/free-icon-sun-day-weather-symbol-54455.png', audio: 'sounds/birds-19624.mp3' },
    { id: 'City', name: 'Місто', icon: 'icons/free-icon-recycling-bin-54324.png', audio: 'sounds/night-city-339223.mp3' }
];

const audioElements = {};
let activeSoundsState = {};
let timerInterval = null;
let timerTargetTime = null;
let pausedRemainingMs = null;

function init() {
    const grid = document.getElementById('soundsGrid');
    
    grid.innerHTML = sounds.map(sound => `
        <div class="sound-card" 
             id="card-${sound.id}" 
             role="button" 
             tabindex="0"
             onclick="toggleSound('${sound.id}')"
             onkeydown="handleKey(event, '${sound.id}')">
             
            <img src="${sound.icon}" alt="" class="sound-icon">
            <div class="sound-name">${sound.name}</div>
            
            <div class="volume-wrapper" onclick="event.stopPropagation()">
                <input type="range" 
                       class="volume-slider" 
                       id="slider-${sound.id}"
                       min="0" max="100" value="50"
                       oninput="handleSliderInput(event, '${sound.id}')"
                       aria-label="Гучність">
            </div>
        </div>
    `).join('');

    loadState();
}

function toggleSound(id) {
    if (!audioElements[id]) {
        const soundData = sounds.find(s => s.id === id);
        const audio = new Audio(soundData.audio);
        audio.loop = true;
        audioElements[id] = audio;
    }

    const audio = audioElements[id];
    const card = document.getElementById(`card-${id}`);

    if (activeSoundsState[id] && activeSoundsState[id].isPlaying) {
        audio.pause();
        audio.currentTime = 0;
        activeSoundsState[id].isPlaying = false;
        card.classList.remove('active');
    } else {
        if (!activeSoundsState[id]) {
            activeSoundsState[id] = { volume: 50, isPlaying: true };
        } else {
            activeSoundsState[id].isPlaying = true;
        }
        
        audio.volume = activeSoundsState[id].volume / 100;
        audio.play().catch(e => console.error(e));
        card.classList.add('active');
        updateVolumeUI(id);
    }
    
    saveState();
}

function handleSliderInput(event, id) {
    event.stopPropagation();
    const value = event.target.value;
    setVolume(id, value);
}

function setVolume(id, volume) {
    if (!activeSoundsState[id]) return;
    
    activeSoundsState[id].volume = volume;
    
    if (audioElements[id]) {
        audioElements[id].volume = volume / 100;
    }
    
    saveState();
}

function updateVolumeUI(id) {
    const slider = document.getElementById(`slider-${id}`);
    if (slider && activeSoundsState[id]) {
        slider.value = activeSoundsState[id].volume;
    }
}

function startTimer() {
    if (pausedRemainingMs && pausedRemainingMs > 0) {
        timerTargetTime = Date.now() + pausedRemainingMs;
        pausedRemainingMs = null;
    } else {
        const input = document.getElementById('minutesInput');
        const minutes = parseInt(input.value) || 0;
        if (minutes <= 0) return;
        timerTargetTime = Date.now() + (minutes * 60 * 1000);
    }

    if (timerInterval) clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(tickTimer, 1000);
    saveState();
}

function tickTimer() {
    if (!timerTargetTime) return;

    const now = Date.now();
    const remainingMs = timerTargetTime - now;

    if (remainingMs <= 0) {
        resetTimer();
        stopAllSounds();
    } else {
        updateTimerUI(Math.ceil(remainingMs / 1000));
    }
}

function pauseTimer() {
    if (timerInterval && timerTargetTime) {
        pausedRemainingMs = timerTargetTime - Date.now();
        clearInterval(timerInterval);
        timerInterval = null;
        saveState();
    }
}

function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerTargetTime = null;
    pausedRemainingMs = null;
    updateTimerUI(0);
    saveState();
}

function updateTimerDisplay() {
    if (pausedRemainingMs) {
        updateTimerUI(Math.ceil(pausedRemainingMs / 1000));
    } else if (timerTargetTime) {
        const remainingMs = timerTargetTime - Date.now();
        updateTimerUI(Math.max(0, Math.ceil(remainingMs / 1000)));
    }
}

function updateTimerUI(secondsLeft) {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    const display = document.getElementById('timerDisplay');
    
    if (secondsLeft <= 0 && !timerTargetTime && !pausedRemainingMs) {
        display.textContent = "00:00";
        document.title = "Звуки сну";
    } else {
        const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        display.textContent = timeStr;
        document.title = `${timeStr} - Звуки сну`;
    }
}

function stopAllSounds() {
    Object.keys(activeSoundsState).forEach(id => {
        if (activeSoundsState[id].isPlaying) {
            if (audioElements[id]) {
                audioElements[id].pause();
                audioElements[id].currentTime = 0;
            }
            activeSoundsState[id].isPlaying = false;
            
            const card = document.getElementById(`card-${id}`);
            if (card) card.classList.remove('active');
        }
    });
    saveState();
}

function handleKey(event, id) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSound(id);
    }
}

function saveState() {
    const data = {
        sounds: activeSoundsState,
        timerTarget: timerTargetTime,
        pausedRemaining: pausedRemainingMs
    };
    localStorage.setItem('sleepSoundsData', JSON.stringify(data));
}

function loadState() {
    const saved = localStorage.getItem('sleepSoundsData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            if (data.sounds) {
                activeSoundsState = data.sounds;
                Object.keys(activeSoundsState).forEach(id => {
                    if (activeSoundsState[id].isPlaying) {
                        activeSoundsState[id].isPlaying = false;
                        toggleSound(id); 
                        setVolume(id, activeSoundsState[id].volume);
                    }
                });
            }

            if (data.pausedRemaining) {
                pausedRemainingMs = data.pausedRemaining;
                updateTimerUI(Math.ceil(pausedRemainingMs / 1000));
            } else if (data.timerTarget) {
                const now = Date.now();
                if (data.timerTarget > now) {
                    timerTargetTime = data.timerTarget;
                    timerInterval = setInterval(tickTimer, 1000);
                    tickTimer();
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
