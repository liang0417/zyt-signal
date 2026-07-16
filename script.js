const page = document.querySelector(".signal-page");
const core = document.querySelector(".core");
const signalField = document.querySelector(".signal-field");
const soundButton = document.querySelector(".sound");
const sequence = [];
let audioContext;
let soundEnabled = false;

function stageFromSequence(signal) {
  const stage = Math.min(3, sequence.length);

  page.dataset.stage = String(stage);
  page.dataset.lastSignal = signal;

  if (stage === 3) {
    page.dataset.ready = "true";
    page.dataset.unlocked = "true";
  }
}

function tone(frequency, duration = 0.08) {
  if (!soundEnabled) return;
  audioContext ||= new AudioContext();

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.frequency.value = frequency;
  osc.type = "sine";
  gain.gain.value = 0.025;
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  osc.stop(audioContext.currentTime + duration);
}

function registerSignal(signal, button) {
  sequence.push(signal);
  if (sequence.length > 10) sequence.shift();
  stageFromSequence(signal);

  button.classList.remove("is-pressed");
  void button.offsetWidth;
  button.classList.add("is-pressed");

  tone(signal === "LSB" ? 392 : 494);
}

const signalButtons = [...document.querySelectorAll("[data-signal]")];

signalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    registerSignal(button.dataset.signal, button);
  });
});

signalField.addEventListener("click", () => {
  const signal = sequence.at(-1) === "LSB" ? "ZYT" : "LSB";
  const button = signalButtons.find((item) => item.dataset.signal === signal);
  registerSignal(signal, button);
});

core.addEventListener("click", (event) => {
  event.stopPropagation();
  signalField.click();
});

soundButton.addEventListener("click", async () => {
  audioContext ||= new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.textContent = soundEnabled ? "sound on" : "sound";
  tone(330);
});
