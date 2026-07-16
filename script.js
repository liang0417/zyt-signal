const page = document.querySelector(".signal-page");
const signalField = document.querySelector(".signal-field");
const soundButton = document.querySelector(".sound");
const memoryPanel = document.querySelector(".memory-panel");
const memoryStatus = document.querySelector("[data-memory-status]");
const memoryHint = document.querySelector("[data-memory-hint]");
const bgmStatus = document.querySelector("[data-bgm-status]");
const soundCloudPlayer = document.querySelector("#soundcloud-player");
const signalButtons = [...document.querySelectorAll("[data-signal]")];
let lastSignal = "ZYT";
let bgm;
let bgmReady = false;
let bgmRequested = false;
let bgmPlaying = false;

function updateBgmState(state) {
  bgmStatus.textContent = state;
  soundButton.disabled = state === "loading";

  if (state === "playing") {
    bgmPlaying = true;
    soundButton.textContent = "pause";
    soundButton.setAttribute("aria-label", "暂停背景音乐");
    soundButton.setAttribute("aria-pressed", "true");
    return;
  }

  bgmPlaying = false;
  soundButton.textContent = state === "unavailable" ? "offline" : "play";
  soundButton.setAttribute(
    "aria-label",
    state === "unavailable" ? "背景音乐暂时不可用" : "播放背景音乐",
  );
  soundButton.setAttribute("aria-pressed", "false");
  soundButton.disabled = state === "unavailable";
}

function playBgm() {
  bgmRequested = true;
  soundButton.disabled = false;

  if (!bgmReady) {
    updateBgmState("loading");
    return;
  }

  bgm.setVolume(38);
  bgm.play();
}

if (window.SC?.Widget && soundCloudPlayer) {
  bgm = window.SC.Widget(soundCloudPlayer);
  bgm.bind(window.SC.Widget.Events.READY, () => {
    bgmReady = true;
    bgm.setVolume(38);
    updateBgmState("ready");
    if (bgmRequested) bgm.play();
  });
  bgm.bind(window.SC.Widget.Events.PLAY, () => updateBgmState("playing"));
  bgm.bind(window.SC.Widget.Events.PAUSE, () => updateBgmState("paused"));
  bgm.bind(window.SC.Widget.Events.FINISH, () => updateBgmState("ended"));
  bgm.bind(window.SC.Widget.Events.ERROR, () => updateBgmState("unavailable"));
} else {
  updateBgmState("unavailable");
}

function revealMemory(signal, button) {
  const firstRelease = page.dataset.memory !== "1";
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

  if (firstRelease) playBgm();
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

soundButton.addEventListener("click", () => {
  if (!bgmReady) {
    playBgm();
    return;
  }

  if (bgmPlaying) {
    bgm.pause();
  } else {
    playBgm();
  }
});
