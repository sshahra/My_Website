const light = document.getElementById('light');
const micToggle = document.getElementById('micToggle');
const body = document.body;

let audioContext;
let analyser;
let microphone;
let javascriptNode;

micToggle.addEventListener('change', function() {
    if (micToggle.checked) {
        startListening();
    } else {
        stopListening();
    }
});

function startListening() {
    if (!navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support microphone access. Please use a supported browser.');
        return;
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);
            javascriptNode.onaudioprocess = function() {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                const values = array.reduce((a, b) => a + b, 0) / array.length;
                if (values > 75) {
                    toggleLight();
                }
            };
        })
        .catch(function(err) {
            console.error('Error accessing microphone:', err);
        });
}

function stopListening() {
    if (microphone) {
        microphone.disconnect();
    }
    if (javascriptNode) {
        javascriptNode.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
}

function toggleLight() {
    if (light.classList.contains('on')) {
        light.classList.remove('on');
        body.classList.remove('bright');
    } else {
        light.classList.add('on');
        body.classList.add('bright');
    }
}
