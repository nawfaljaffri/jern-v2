let audioCtx: AudioContext | null = null;
let humOscillator: OscillatorNode | null = null;
let humGain: GainNode | null = null;
export let isMuted = false;

export const initAudio = () => {
  if (!audioCtx) {
    // @ts-ignore
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

export const toggleMute = () => {
  isMuted = !isMuted;
  if (audioCtx) {
    if (isMuted && humGain) humGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.015);
    else if (!isMuted && humGain) humGain.gain.setTargetAtTime(0.05, audioCtx.currentTime, 0.015);
  }
  return isMuted;
};

const playTone = (type: OscillatorType, freqStart: number, freqEnd: number, duration: number, vol: number) => {
  if (!audioCtx || isMuted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + duration);
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const playClack = () => playTone('triangle', 300, 100, 0.05, 0.4);
export const playTick = () => playTone('square', 800, 600, 0.015, 0.1);
export const playBootUp = () => {
  playTone('square', 100, 40, 0.1, 0.4); // Heavy initial clunk
  playTone('sawtooth', 40, 10, 0.5, 0.3); // Low electrical decay
};

export const playPowerOff = () => {
  playTone('square', 2000, 100, 0.05, 0.2); 
  playTone('sawtooth', 50, 10, 0.4, 0.3);    
};

export const playModalOpen = () => playTone('square', 150, 100, 0.02, 0.1);
export const playModalClose = () => playTone('square', 100, 50, 0.02, 0.1);
export const playEnter = () => {
  playTone('triangle', 200, 50, 0.1, 0.5);
  playTone('sine', 150, 40, 0.1, 0.5);
};


export const startHum = () => {
  if (!audioCtx || humOscillator) return;
  humOscillator = audioCtx.createOscillator();
  humGain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  
  humOscillator.type = 'sawtooth';
  humOscillator.frequency.value = 60;
  filter.type = 'lowpass';
  filter.frequency.value = 150;
  
  humOscillator.connect(filter);
  filter.connect(humGain);
  humGain.connect(audioCtx.destination);
  
  humGain.gain.value = isMuted ? 0 : 0.05;
  humOscillator.start();
};
