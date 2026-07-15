const page = document.querySelector(".signal-page");
const core = document.querySelector(".core");
const soundButton = document.querySelector(".sound");
const sequence = [];
let holdTimer = 0;
let audioContext;
let soundEnabled = false;

function stageFromSequence() {
  const lastSix = sequence.slice(-6).join("");
  const alternating =
    lastSix === "LSBZYTLSBZYTLSBZYT" || lastSix === "ZYTLSBZYTLSBZYTLSB";
  const stage = Math.min(3, Math.floor(sequence.length / 2));

  page.dataset.stage = String(stage);

  if (alternating || stage === 3) {
    page.dataset.ready = "true";
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

document.querySelectorAll("[data-signal]").forEach((button) => {
  button.addEventListener("click", () => {
    const signal = button.dataset.signal;
    sequence.push(signal);
    if (sequence.length > 10) sequence.shift();
    stageFromSequence();
    tone(signal === "LSB" ? 392 : 494);
  });
});

function startHold() {
  if (page.dataset.stage !== "3" && page.dataset.ready !== "true") return;
  page.dataset.holding = "true";
  holdTimer = window.setTimeout(() => {
    page.dataset.unlocked = "true";
    page.dataset.holding = "false";
    tone(660, 0.3);
  }, 2000);
}

function stopHold() {
  window.clearTimeout(holdTimer);
  page.dataset.holding = "false";
}

core.addEventListener("pointerdown", startHold);
core.addEventListener("pointerup", stopHold);
core.addEventListener("pointerleave", stopHold);
core.addEventListener("pointercancel", stopHold);

soundButton.addEventListener("click", async () => {
  audioContext ||= new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.textContent = soundEnabled ? "sound on" : "sound";
  tone(330);
});
