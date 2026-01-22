//Initialize speech recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

//Configure speech recognition
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = true;


//Event handlers
let fullTranscript = '';

recognition.onresult = function(event) {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript;
    console.log('Recognized:', transcript);

    //Update full transcript
    if (event.results[last].isFinal) {
        fullTranscript += transcript + ' ';
        updateTranscriptDisplay();
    } else {
        //Show interim results
        const tempTranscript = fullTranscript + transcript;
        document.getElementById('transcriptDisplay').textContent = tempTranscript;
    }
};

recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
};

recognition.onend = function() {
    console.log('Speech recognition ended');
};


//Control functions
function startSpeechRecognition() {
    try {
        recognition.start();
        console.log('Speech recognition started');
    } catch (error) {
        console.error('Error starting speech recognition:', error);
    }
}

function stopSpeechRecognition() {
    recognition.stop();
    console.log('Speech recognition stopped');
}


//Update transcript display with 2-line limit
function updateTranscriptDisplay() {
    const displayElement = document.getElementById('transcriptDisplay');
    displayElement.textContent = fullTranscript;

    //Check if text exceeds 2 lines
    const lineHeight = parseFloat(getComputedStyle(displayElement).lineHeight);
    const maxHeight = lineHeight * 2;

    while (displayElement.scrollHeight > maxHeight && fullTranscript.length > 0) {
        //Remove words from the beginning
        const words = fullTranscript.split(' ');
        words.shift();
        fullTranscript = words.join(' ');
        displayElement.textContent = fullTranscript;
    }
}


//Clear transcript when restarting
function clearTranscript() {
    fullTranscript = '';
    const displayElement = document.getElementById('transcriptDisplay');
    if (displayElement) {
        displayElement.textContent = '';
    }
}
