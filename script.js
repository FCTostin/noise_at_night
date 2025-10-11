const sounds = [
    { 
        id: 'Дождь', 
        name: 'Дощь', 
        icon: 'https://i.imgur.com/RSg5DA0.png',
        audio: 'sounds/soft-rain-on-a-tile-roof-14515.mp3'
    },
    { 
        id: 'Гроза', 
        name: 'Гроза', 
        icon: 'https://i.imgur.com/D1dDV21.png',
        audio: 'sounds/rain-and-wind-chimes-314370.mp3'
    },
    { 
        id: 'Ветер', 
        name: 'Вітер', 
        icon: 'https://i.imgur.com/ASvjZgs.png',
        audio: 'sounds/soft-wind-316392.mp3'
    },
    { 
        id: 'Лес', 
        name: 'Ліс', 
        icon: 'https://i.imgur.com/YznJuVZ.png',
        audio: 'sounds/forest-wind-with-crickets-and-cuckoo-355613.mp3'
    },
    { 
        id: 'Бриз', 
        name: 'Бриз', 
        icon: 'https://i.imgur.com/RDOMJwU.png',
        audio: 'sounds/ocean-waves-250310.mp3'
    },
    { 
        id: 'Ураган', 
        name: 'Ураган', 
        icon: 'https://i.imgur.com/fQ7WkZF.png',
        audio: 'sounds/rain-and-thunder-321270.mp3'
    },
    { 
        id: 'Ночь', 
        name: 'Ніч', 
        icon: 'https://i.imgur.com/qky4HV2.png',
        audio: 'sounds/night-ambience-17064.mp3'
    },
    { 
        id: 'Костёр', 
        name: 'Костер', 
        icon: 'https://i.imgur.com/M3Ejw7c.png',
        audio: 'sounds/crackling-fire-14759.mp3'
    },
    { 
        id: 'Утро', 
        name: 'Ранок', 
        icon: 'https://i.imgur.com/iKqbcZx.png',
        audio: 'sounds/birds-19624.mp3'
    },
    { 
        id: 'Город', 
        name: 'Місто', 
        icon: 'https://i.imgur.com/0mgpmdu.png',
        audio: 'sounds/night-city-side-street-with-passing-cars-and-distant-urban-ambience-339223.mp3'
    }
];

const audioElements = {};
const activeSounds = {};
let timerInterval = null;
let remainingSeconds = 0;

function saveState() {
    const state = {
        activeSounds: activeSounds,
        timer: remainingSeconds
    };
    localStorage.setItem('natureSoundsState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('natureSoundsState');
    if (saved) {
        const state = JSON.parse(saved);
        Object.keys(state.activeSounds).forEach(id => {
            if (audioElements[id]) {
                activeSounds[id] = state.activeSounds[id];
                audioElements[id].volume = state.activeSounds[id].volume / 100;
                audioElements[id].play();
                
                const card = document.getElementById(`card-${id}`);
                const volumeControl = document.getElementById(`volume-${id}`);
                card.classList.add('active');
                volumeControl.classList.add('visible');
                
                document.getElementById(`fill-${id}`).style.width = `${state.activeSounds[id].volume}%`;
                document.getElementById(`value-${id}`).textContent = `${state.activeSounds[id].volume}%`;
            }
        });
        
        if (state.timer > 0) {
            remainingSeconds = state.timer;
            updateTimerDisplay();
        }
    }
}

function initSounds() {
    const grid = document.getElementById('soundsGrid');
    grid.innerHTML = sounds.map(sound => `
        <div class="sound-card" id="card-${sound.id}" onclick="toggleSound('${sound.id}')">
            <img src="${sound.icon}" alt="${sound.name}" class="sound-icon">
            <div class="sound-name">${sound.name}</div>
            <div class="volume-control" id="volume-${sound.id}">
                <div class="volume-item">
                    <button class="volume-btn" onclick="event.stopPropagation(); changeVolume('${sound.id}', -5)">−</button>
                    <div class="volume-slider" onclick="event.stopPropagation(); handleSliderClick(event, '${sound.id}')">
                        <div class="volume-slider-fill" id="fill-${sound.id}" style="width: 50%"></div>
                    </div>
                    <button class="volume-btn" onclick="event.stopPropagation(); changeVolume('${sound.id}', 5)">+</button>
                    <div class="volume-value" id="value-${sound.id}">50%</div>
                </div>
            </div>
        </div>
    `).join('');

    sounds.forEach(sound => {
        const audio = new Audio(sound.audio);
        audio.loop = true;
        audio.volume = 0.5;
        audioElements[sound.id] = audio;
    });
}

function toggleSound(id) {
    const card = document.getElementById(`card-${id}`);
    const volumeControl = document.getElementById(`volume-${id}`);
    const audio = audioElements[id];

    if (activeSounds[id]) {
        audio.pause();
        audio.currentTime = 0;
        delete activeSounds[id];
        card.classList.remove('active');
        volumeControl.classList.remove('visible');
    } else {
        audio.play();
        activeSounds[id] = { volume: 50 };
        card.classList.add('active');
        volumeControl.classList.add('visible');
    }
    
    saveState();
}

function changeVolume(id, delta) {
    if (!activeSounds[id]) return;
    
    const newVolume = Math.max(0, Math.min(100, activeSounds[id].volume + delta));
    setVolume(id, newVolume);
}

function handleSliderClick(event, id) {
    const slider = event.currentTarget;
    const rect = slider.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    
    setVolume(id, Math.max(0, Math.min(100, percentage)));
}

function setVolume(id, volume) {
    activeSounds[id].volume = volume;
    audioElements[id].volume = volume / 100;
    
    document.getElementById(`fill-${id}`).style.width = `${volume}%`;
    document.getElementById(`value-${id}`).textContent = `${volume}%`;
    
    saveState();
}

function startTimer() {
    const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
    remainingSeconds = minutes * 60;
    
    if (remainingSeconds <= 0) return;

    stopTimer();
    updateTimerDisplay();
    saveState();
    
    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();
        saveState();
        
        if (remainingSeconds <= 0) {
            stopTimer();
            stopAllSounds();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    remainingSeconds = 0;
    updateTimerDisplay();
    saveState();
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function stopAllSounds() {
    Object.keys(activeSounds).forEach(id => {
        const audio = audioElements[id];
        audio.pause();
        audio.currentTime = 0;
        delete activeSounds[id];
        
        document.getElementById(`card-${id}`).classList.remove('active');
        document.getElementById(`volume-${id}`).classList.remove('visible');
    });
    saveState();
}

initSounds();
loadState();
