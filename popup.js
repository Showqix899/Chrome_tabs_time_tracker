function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateTimer() {
  chrome.runtime.sendMessage("getTime", (response) => {
    if (response && response.seconds !== undefined) {
      document.getElementById("timer").textContent = formatTime(response.seconds);
    }
  });
}

setInterval(updateTimer, 1000);
updateTimer();