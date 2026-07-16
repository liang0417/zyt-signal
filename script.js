const page = document.querySelector(".signal-page");
const signalField = document.querySelector(".signal-field");
const soundButton = document.querySelector(".sound");
const memoryPanel = document.querySelector(".memory-panel");
const memoryStatus = document.querySelector("[data-memory-status]");
const memoryHint = document.querySelector("[data-memory-hint]");
const signalButtons = [...document.querySelectorAll("[data-signal]")];
let lastSignal = "ZYT";
let audioContext;
let soundEnabled = false;

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

function revealMemory(signal, button) {
  lastSignal = signal;
  page.dataset.stage = "1";
  page.dataset.memory = "1";
  page.dataset.lastSignal = signal;
  memoryPanel.setAttribute("aria-hidden", "false");
  memoryStatus.textContent = "MEMORY 01 OF 01";
  memoryHint.textContent = "第一段记忆已接收 · 再次轻触可重放";

  button.classList.remove("is-pressed");
  void button.offsetWidth;
  button.classList.add("is-pressed");

  memoryPanel.classList.remove("is-replaying");
  void memoryPanel.offsetWidth;
  memoryPanel.classList.add("is-replaying");

  tone(signal === "LSB" ? 392 : 494);
}

signalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    revealMemory(button.dataset.signal, button);
  });
});

signalField.addEventListener("click", () => {
  const signal = lastSignal === "LSB" ? "ZYT" : "LSB";
  const button = signalButtons.find((item) => item.dataset.signal === signal);
  revealMemory(signal, button);
});

soundButton.addEventListener("click", async () => {
  audioContext ||= new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.textContent = soundEnabled ? "sound on" : "sound";
  tone(330);
});
