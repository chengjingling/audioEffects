// audio files
var currentAudio;
var defaultAudio;
var recordedAudio;

// playback controls
var pauseButton;
var playButton;
var stopButton;
var skipStartButton;
var skipEndButton;
var loopButton;
var recordButton;
var currentAudioText;
var useDefaultAudioButton;

// audio recorder
var mic;
var recorder;
var state;

// low-pass filter
var lp;
var lp_cutOffSlider;
var lp_resonanceSlider;
var lp_dryWetSlider;
var lp_outputSlider;

// waveshaper distortion
var wd;
var wd_amountSlider;
var wd_oversampleSlider;
var wd_dryWetSlider;
var wd_outputSlider;

// dynamic compressor
var dc;
var dc_attackSlider;
var dc_kneeSlider;
var dc_releaseSlider;
var dc_ratioSlider;
var dc_thresholdSlider;
var dc_dryWetSlider;
var dc_outputSlider;

// reverb
var rv;
var rv_durationSlider;
var rv_decaySlider;
var rv_dryWetSlider;
var rv_outputSlider;
var rv_reverseButton;
var rv_reverseBoolean;

// master volume
var mv_volumeSlider;

// spectrums
var fft_in;
var fft_out;

function preload() {
    defaultAudio = loadSound('../sounds/poem_recording.wav');
}

function setup() {
    createCanvas(800, 600);
    gui_configuration();
}

function gui_configuration() {
    // audio files
    currentAudio = defaultAudio;
    recordedAudio = new p5.SoundFile();
    
    // playback controls
    pauseButton = createButton('pause');
    pauseButton.position(10, 20);
    pauseButton.mousePressed(pauseSound);
    playButton = createButton('play');
    playButton.position(70, 20);
    playButton.mousePressed(playSound);
    stopButton = createButton('stop');
    stopButton.position(120, 20);
    stopButton.mousePressed(stopSound);
    skipStartButton = createButton('skip to start');
    skipStartButton.position(170, 20);
    skipStartButton.mousePressed(skipToStart);
    skipEndButton = createButton('skip to end');
    skipEndButton.position(263, 20);
    skipEndButton.mousePressed(skipToEnd);
    loopButton = createButton('loop');
    loopButton.position(352, 20);
    loopButton.mousePressed(loopSound);
    recordButton = createButton('record');
    recordButton.position(402, 20);
    recordButton.mousePressed(recordSound);
    currentAudioText = 'now playing: default audio';
    useDefaultAudioButton = createButton('use default audio');
    useDefaultAudioButton.position(670, 20);
    useDefaultAudioButton.mousePressed(useDefaultAudio);
    
    // audio recorder
    mic = new p5.AudioIn();
    mic.start();
    
    recorder = new p5.SoundRecorder();
    recorder.setInput(mic);
    
    state = 0;

    // low-pass filter
    lp = new p5.LowPass();
    
    lp_cutOffSlider = createSlider(10, 22050, 11030, 0);
    lp_cutOffSlider.position(10, 110);
    
    lp_resonanceSlider = createSlider(0.001, 1000, 0.001, 0);
    lp_resonanceSlider.position(10, 155);
    
    lp_dryWetSlider = createSlider(0, 1, 0.5, 0);
    lp_dryWetSlider.position(10, 200);
    
    lp_outputSlider = createSlider(0, 1, 0.5, 0);
    lp_outputSlider.position(10, 245);

    // waveshaper distortion
    wd = new p5.Distortion();
    
    wd_amountSlider = createSlider(0, 1, 0.25, 0);
    wd_amountSlider.position(210, 335);
    
    wd_oversampleSlider = createSlider(0, 4, 0, 2);
    wd_oversampleSlider.position(210, 380);
    
    wd_dryWetSlider = createSlider(0, 1, 0.5, 0);
    wd_dryWetSlider.position(210, 425);
    
    wd_outputSlider = createSlider(0, 1, 0.5, 0);
    wd_outputSlider.position(210, 470);

    // dynamic compressor
    dc = new p5.Compressor();
    
    dc_attackSlider = createSlider(0, 1, 0.003, 0);
    dc_attackSlider.position(210, 110);
    
    dc_kneeSlider = createSlider(0, 40, 30, 0);
    dc_kneeSlider.position(210, 155);
    
    dc_releaseSlider = createSlider(0, 1, 0.25, 0);
    dc_releaseSlider.position(210, 200);
    
    dc_ratioSlider = createSlider(1, 20, 12, 0);
    dc_ratioSlider.position(210, 245);
    
    dc_thresholdSlider = createSlider(-100, 0, -24, 0);
    dc_thresholdSlider.position(360, 110);
    
    dc_dryWetSlider = createSlider(0, 1, 0.5, 0);
    dc_dryWetSlider.position(360, 155);
    
    dc_outputSlider = createSlider(0, 1, 0.5, 0);
    dc_outputSlider.position(360, 200);

    // reverb
    rv = new p5.Reverb();
    
    rv_durationSlider = createSlider(0, 10, 3, 0);
    rv_durationSlider.position(10, 335);
    rv_durationSlider.input(updateReverb);
    
    rv_decaySlider = createSlider(0, 100, 2, 0);
    rv_decaySlider.position(10, 380);
    rv_decaySlider.input(updateReverb);
    
    rv_dryWetSlider = createSlider(0, 1, 0.5, 0);
    rv_dryWetSlider.position(10, 425);
    
    rv_outputSlider = createSlider(0, 1, 0.5, 0);
    rv_outputSlider.position(10, 470);
    
    rv_reverseButton = createButton('reverb reverse');
    rv_reverseButton.position(10, 510);
    rv_reverseButton.mousePressed(reverbReverse);
    
    rv_reverseBoolean = false;

    // master volume
    mv_volumeSlider = createSlider(0, 1, 0.5, 0);
    mv_volumeSlider.position(560, 110);

    // spectrums
    fft_in = new p5.FFT();
    fft_out = new p5.FFT();
    
    // connect effects in a chain
    connectAudio();
}

function connectAudio() {
    currentAudio.disconnect();
    currentAudio.connect(lp);
    lp.connect(wd);
    wd.connect(dc);
    dc.connect(rv);
    rv.connect();
    fft_in.setInput(currentAudio);
    fft_out.setInput(soundOut);
}

function draw() {
    background(180);
    
    // texts
    text(currentAudioText, 490, 35);
    
    textSize(14);
    text('low-pass filter', 10, 80);
    textSize(10);
    text('cutoff frequency', 10, 105);
    text('resonance', 10, 150);
    text('dry/wet', 10, 195);
    text('output level', 10, 240);
    
    textSize(14);
    text('waveshaper distortion', 210, 305);
    textSize(10);
    text('distortion amount', 210, 330);
    text('oversample', 210, 375);
    text('dry/wet', 210, 420);
    text('output level', 210, 465);
    
    textSize(14);
    text('dynamic compressor', 210, 80);
    textSize(10);
    text('attack', 210, 105);
    text('knee', 210, 150);
    text('release', 210, 195);
    text('ratio', 210, 240);
    text('threshold', 360, 105);
    text('dry/wet', 360, 150);
    text('output level', 360, 195);
    
    textSize(14);
    text('reverb', 10, 305);
    textSize(10);
    text('duration', 10, 330);
    text('decay', 10, 375);
    text('dry/wet', 10, 420);
    text('output level', 10, 465);
    if (rv_reverseBoolean) {
        text('reversed', 130, 523);
    }
    else {
        text('normal', 130, 523);
    }
    
    textSize(14);
    text('master volume', 560, 80);
    textSize(10);
    text('level', 560, 105);
    
    textSize(14);
    text('spectrum in', 560, 200);
    text('spectrum out', 560, 345);
    
    // low-pass filter
    lp.set(lp_cutOffSlider.value(), lp_resonanceSlider.value());
    lp.drywet(lp_dryWetSlider.value());
    lp.amp(lp_outputSlider.value());
    
    // waveshaper distortion
    if (wd_oversampleSlider.value() === 0) {
        wd.set(wd_amountSlider.value(), 'none');
    }
    else if (wd_oversampleSlider.value() === 2) {
        wd.set(wd_amountSlider.value(), '2x');
    }
    else if (wd_oversampleSlider.value() === 4) {
        wd.set(wd_amountSlider.value(), '4x');
    }
    wd.drywet(wd_dryWetSlider.value());
    wd.amp(wd_outputSlider.value());
    
    // dynamic compressor
    dc.set(dc_attackSlider.value(), dc_kneeSlider.value(), dc_ratioSlider.value(), dc_thresholdSlider.value(), dc_releaseSlider.value());
    dc.drywet(dc_dryWetSlider.value());
    dc.amp(dc_outputSlider.value());
    
    // reverb
    rv.drywet(rv_dryWetSlider.value());
    rv.amp(rv_outputSlider.value());
    
    // master volume
    outputVolume(mv_volumeSlider.value());
    
    // spectrums
    var spectrum_in = fft_in.analyze();
    push();
    translate(560, 210);
    scale(0.25, 0.2);
    noStroke();
    fill(60);
    rect(0, 0, width, height);
    fill(255, 0, 0);
    for (let i = 0; i < spectrum_in.length; i++) {
        let x = map(i, 0, spectrum_in.length, 0, width);
        let h = -height + map(spectrum_in[i], 0, 255, height, 0);
        rect(x, height, width/spectrum_in.length, h);
    }
    pop();
    
    var spectrum_out = fft_out.analyze();
    push();
    translate(560, 355);
    scale(0.25, 0.2);
    noStroke();
    fill(60);
    rect(0, 0, width, height);
    fill(255, 0, 0);
    for (let i = 0; i < spectrum_out.length; i++) {
        let x = map(i, 0, spectrum_out.length, 0, width);
        let h = -height + map(spectrum_out[i], 0, 255, height, 0);
        rect(x, height, width/spectrum_out.length, h);
    }
    pop();
}

function playSound() {
    if (!currentAudio.isPlaying()) {
        currentAudio.play();
    }
}

function pauseSound() {
    currentAudio.pause();
}

function stopSound() {
    currentAudio.stop();
}

function skipToStart() {
    currentAudio.jump(0);
}

function skipToEnd() {
    currentAudio.jump(currentAudio.duration());
}

function loopSound() {
    if (!currentAudio.isPlaying()) {
        currentAudio.loop();
    }
}

function recordSound() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
    
    if (state === 0 && mic.enabled) {
        stopSound();
        recorder.record(recordedAudio);
        recordButton.html('recording...');
        state = 1;
    }
    
    else if (state === 1) {
        recorder.stop();
        recordButton.html('record');
        state = 0;
        currentAudio = recordedAudio;
        connectAudio();
        currentAudioText = 'now playing: recorded audio';
    }
}

function useDefaultAudio() {
    stopSound();
    currentAudio = defaultAudio;
    connectAudio();
    currentAudioText = 'now playing: default audio';
}

function reverbReverse() {
    rv_reverseBoolean = !rv_reverseBoolean;
    updateReverb();
}

function updateReverb() {
    rv.set(rv_durationSlider.value(), rv_decaySlider.value(), rv_reverseBoolean);
}