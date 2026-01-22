//Get elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');
const resumeBtn = document.getElementById('resumeBtn');


//Set canvas size
canvas.width = 600;
canvas.height = 600;


//Variables
let isListening = false;
let audioContext;
let analyser;
let microphone;
let dataArray;

//Drawing variables
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let angle = 0;
let radius = 0;
let lastX = centerX;
let lastY = centerY;
let isExpanding = true;

const SILENCE_THRESHOLD = 10;
const MAX_RADIUS = canvas.width / 2 - 30;
const LINE_WIDTH = 3;


//Start button click
startBtn.addEventListener('click', async () => {
    try {
        await startListening();
        startBtn.classList.add('hidden');
        stopBtn.classList.add('show');
    } catch (error) {
        alert('无法访问麦克风，请允许麦克风权限');
        console.error(error);
    }
});


//Stop button click
stopBtn.addEventListener('click', () => {
    if (isListening) {
        stopListening();
        stopBtn.classList.remove('show');
        resumeBtn.classList.add('show');
        restartBtn.classList.add('show');
    }
});


//Resume button click
resumeBtn.addEventListener('click', async () => {
    if (!isListening) {
        await startListening();
        resumeBtn.classList.remove('show');
        stopBtn.classList.add('show');
    }
});


//Restart button click
restartBtn.addEventListener('click', async () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle = 0;
    radius = 0;
    lastX = centerX;
    lastY = centerY;
    isExpanding = true;
    clearTranscript();

    if (isListening) {
        stopListening();
    }

    await startListening();
    restartBtn.classList.remove('show');
    stopBtn.classList.add('show');
});


//Start listening function
async function startListening() {
    startSpeechRecognition();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    isListening = true;
    draw();
}


//Stop listening function
function stopListening() {
    isListening = false;
    stopSpeechRecognition();
    if (audioContext) {
        audioContext.close();
    }
}


//Draw function with wave effect
function draw() {
    if (!isListening) return;

    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const averageVolume = sum / dataArray.length;

    let waveAmplitude;
    let waveFrequency;

    if (averageVolume < SILENCE_THRESHOLD) {
        //No sound: dashed line
        ctx.setLineDash([5, 5]);
        waveAmplitude = 0;
        waveFrequency = 0;
    } else {
        //Sound detected: solid line with wave
        ctx.setLineDash([]);
        waveAmplitude = map(averageVolume, SILENCE_THRESHOLD, 100, 5, 30);
        waveFrequency = map(averageVolume, SILENCE_THRESHOLD, 100, 0.5, 3);
    }

    //Spiral growth/shrink
    if (isExpanding) {
        angle += 0.08;
        radius += 0.4;

        if (radius >= MAX_RADIUS) {
            isExpanding = false;
        }
    } else {
        angle += 0.08;
        radius -= 0.4;

        if (radius <= 0) {
            isExpanding = true;
            radius = 0;
        }
    }

    //Calculate wave coordinates
    const waveOffset = Math.sin(angle * waveFrequency) * waveAmplitude;
    const effectiveRadius = radius + waveOffset;

    const newX = centerX + Math.cos(angle) * effectiveRadius;
    const newY = centerY + Math.sin(angle) * effectiveRadius;

    //Draw line
    ctx.strokeStyle = '#5a3a2a';
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(newX, newY);
    ctx.stroke();

    lastX = newX;
    lastY = newY;

    requestAnimationFrame(draw);
}


//Helper function
function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
