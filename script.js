"use strict";

const gameCards = [...document.querySelectorAll(".game-card")];
const gameSearch = document.querySelector("#game-search");
const gameResults = document.querySelector("#game-results");
const emptyGames = document.querySelector("#empty-games");
let activeGenre = "all";

function filterGames() {
  const query = gameSearch.value.trim().toLowerCase();
  let visible = 0;
  gameCards.forEach((card) => {
    const matchesTitle = card.dataset.title.toLowerCase().includes(query);
    const matchesGenre = activeGenre === "all" || card.dataset.genres.split(" ").includes(activeGenre);
    card.hidden = !(matchesTitle && matchesGenre);
    if (!card.hidden) visible += 1;
  });
  gameResults.textContent = `Showing ${visible} ${visible === 1 ? "game" : "games"}`;
  emptyGames.hidden = visible > 0;
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeGenre = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    filterGames();
  });
});
gameSearch.addEventListener("input", filterGames);
document.querySelector(".search-toggle").addEventListener("click", () => {
  document.querySelector("#games").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => gameSearch.focus({ preventScroll: true }), 450);
});

const leaderboardData = {
  daily: [
    ["1", "NovaX", "9,820", "34"], ["2", "K1ngSlayer", "8,640", "29"], ["3", "PixelRush", "7,910", "27"], ["4", "LunaByte", "7,240", "25"], ["5", "GhostMode", "6,880", "23"], ["6", "VexZero", "6,310", "21"], ["7", "CloudNine", "5,970", "20"], ["8", "HexaPlay", "5,420", "18"], ["9", "RiftWalker", "4,980", "16"], ["10", "EchoStrike", "4,560", "15"]
  ],
  weekly: [
    ["1", "LunaByte", "48,350", "162"], ["2", "NovaX", "45,920", "155"], ["3", "GhostMode", "41,780", "148"], ["4", "PixelRush", "39,640", "139"], ["5", "K1ngSlayer", "37,210", "133"], ["6", "RiftWalker", "34,890", "124"], ["7", "CloudNine", "32,450", "117"], ["8", "VexZero", "30,130", "109"], ["9", "EchoStrike", "28,870", "101"], ["10", "HexaPlay", "26,440", "94"]
  ],
  alltime: [
    ["1", "GhostMode", "582,410", "1,840"], ["2", "K1ngSlayer", "554,280", "1,762"], ["3", "NovaX", "519,630", "1,694"], ["4", "CloudNine", "486,920", "1,585"], ["5", "LunaByte", "462,710", "1,523"], ["6", "EchoStrike", "438,060", "1,447"], ["7", "PixelRush", "412,850", "1,369"], ["8", "VexZero", "398,220", "1,310"], ["9", "HexaPlay", "371,540", "1,229"], ["10", "RiftWalker", "354,190", "1,174"]
  ]
};

function renderLeaderboard(period) {
  const body = document.querySelector("#leaderboard-body");
  body.replaceChildren(...leaderboardData[period].map(([rank, name, points, wins]) => {
    const row = document.createElement("tr");
    row.className = `rank-${rank}`;
    const initials = name.slice(0, 2).toUpperCase();
    row.innerHTML = `<td class="rank-number">${rank.toString().padStart(2, "0")}</td><td><span class="player-cell"><span class="player-avatar" aria-hidden="true">${initials}</span>${name}</span></td><td class="rank-points">${points}</td><td>${wins}</td>`;
    return row;
  }));
}

document.querySelectorAll(".rank-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".rank-tab").forEach((tab) => {
      const selected = tab === button;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });
    renderLeaderboard(button.dataset.period);
  });
});
renderLeaderboard("daily");

const playArea = document.querySelector("#mini-play-area");
const target = document.querySelector("#click-target");
const scoreDisplay = document.querySelector("#click-score");
const timeDisplay = document.querySelector("#click-time");
const bestDisplay = document.querySelector("#click-best");
const promptDisplay = document.querySelector("#mini-prompt");
const finishDisplay = document.querySelector("#mini-finish");
const startButton = document.querySelector("#start-game");
const restartButton = document.querySelector("#restart-game");
let score = 0;
let secondsLeft = 30;
let gameTimer = null;
let gameRunning = false;
let bestScore = Number(localStorage.getItem("gamezone-click-best") || 0);
bestDisplay.textContent = String(bestScore).padStart(2, "0");

function placeTarget() {
  const padding = 8;
  const maximumX = Math.max(padding, playArea.clientWidth - target.offsetWidth - padding);
  const maximumY = Math.max(padding, playArea.clientHeight - target.offsetHeight - padding);
  target.style.left = `${padding + Math.random() * (maximumX - padding)}px`;
  target.style.top = `${padding + Math.random() * (maximumY - padding)}px`;
}

function endClickGame() {
  gameRunning = false;
  window.clearInterval(gameTimer);
  target.hidden = true;
  finishDisplay.innerHTML = `<strong>${score} ${score === 1 ? "POINT" : "POINTS"}</strong><span>Time. Final score.</span>`;
  finishDisplay.hidden = false;
  restartButton.hidden = false;
  startButton.hidden = true;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("gamezone-click-best", String(bestScore));
    bestDisplay.textContent = String(bestScore).padStart(2, "0");
  }
}

function startClickGame() {
  window.clearInterval(gameTimer);
  score = 0;
  secondsLeft = 30;
  gameRunning = true;
  scoreDisplay.textContent = "00";
  timeDisplay.textContent = "30";
  promptDisplay.hidden = true;
  finishDisplay.hidden = true;
  target.hidden = false;
  startButton.hidden = true;
  restartButton.hidden = true;
  placeTarget();
  gameTimer = window.setInterval(() => {
    secondsLeft -= 1;
    timeDisplay.textContent = String(secondsLeft);
    if (secondsLeft <= 0) endClickGame();
  }, 1000);
}

target.addEventListener("click", () => {
  if (!gameRunning) return;
  score += 1;
  scoreDisplay.textContent = String(score).padStart(2, "0");
  placeTarget();
});
startButton.addEventListener("click", startClickGame);
restartButton.addEventListener("click", startClickGame);

const authModal = document.querySelector("#auth-modal");
const infoModal = document.querySelector("#info-modal");
const authForm = document.querySelector("#auth-form");
const authMessage = document.querySelector("#form-message");
let authMode = "login";

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("modal-open");
}

function closeDialog(dialog) {
  dialog.close();
  if (!document.querySelector("dialog[open]")) document.body.classList.remove("modal-open");
}

document.querySelectorAll(".login-trigger").forEach((button) => button.addEventListener("click", () => openDialog(authModal)));
document.querySelectorAll(".modal-close").forEach((button) => button.addEventListener("click", () => closeDialog(button.closest("dialog"))));
document.querySelector(".info-close").addEventListener("click", () => closeDialog(infoModal));
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
  dialog.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) document.body.classList.remove("modal-open");
  });
});

document.querySelectorAll(".auth-tab").forEach((button) => {
  button.addEventListener("click", () => {
    authMode = button.dataset.authMode;
    document.querySelectorAll(".auth-tab").forEach((tab) => {
      const selected = tab === button;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });
    const password = document.querySelector("#password");
    password.autocomplete = authMode === "login" ? "current-password" : "new-password";
    document.querySelector("#auth-submit-label").textContent = authMode === "login" ? "Enter the lobby" : "Create demo profile";
    authMessage.textContent = "";
    authMessage.classList.remove("success");
  });
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  authMessage.classList.remove("success");
  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value;
  if (username.length < 3) {
    authMessage.textContent = "Username must be at least 3 characters.";
    document.querySelector("#username").focus();
    return;
  }
  if (password.length < 8) {
    authMessage.textContent = "Password must be at least 8 characters.";
    document.querySelector("#password").focus();
    return;
  }
  authMessage.classList.add("success");
  authMessage.textContent = authMode === "login" ? "Demo only: no sign-in was performed." : "Demo only: no account was created.";
});

function showInfo(kicker, title, description) {
  document.querySelector("#info-kicker").textContent = kicker;
  document.querySelector("#info-title").textContent = title;
  document.querySelector("#info-description").textContent = description;
  openDialog(infoModal);
}

document.querySelectorAll(".details-button").forEach((button) => {
  button.addEventListener("click", () => showInfo("GAME SPOTLIGHT", button.dataset.game, "This is a sample game listing. GameZone is a discovery demo and does not provide downloads, store links, or live game-service data."));
});
document.querySelectorAll(".news-read").forEach((button) => {
  button.addEventListener("click", () => showInfo("SAMPLE ARTICLE · NOT LIVE NEWS", button.dataset.article, "This short sample article is included to demonstrate the GameZone news layout. Connect a trusted news API or CMS to publish current stories."));
});

document.querySelectorAll(".game-art img, .news-image img").forEach((image) => {
  image.addEventListener("error", () => {
    image.classList.add("image-failed");
    image.parentElement.classList.add("image-fallback");
  }, { once: true });
});

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
  primaryNav.classList.toggle("open", !expanded);
});
primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  primaryNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}));

const navLinks = [...document.querySelectorAll(".nav-link")];
const observedSections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  const visibleEntry = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visibleEntry) return;
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${visibleEntry.target.id}`;
    link.classList.toggle("active", active);
  });
}, { rootMargin: "-20% 0px -65% 0px", threshold: [0, .15, .4] });
observedSections.forEach((section) => sectionObserver.observe(section));