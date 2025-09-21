function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

let allRecords = {};
let displayed = 0;
const batchSize = 10;

function renderRecords() {
  const recordsList = document.getElementById("records");

  // slice data to display next batch
  const domains = Object.keys(allRecords);
  const slice = domains.slice(0, displayed);

  recordsList.innerHTML = "";
  slice.forEach(domain => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${domain}: ${formatTime(allRecords[domain])}</span>
      <button data-domain="${domain}">clear</button>
    `;
    recordsList.appendChild(li);
  });

  // show or hide load more
  document.getElementById("loadMore").style.display = 
    displayed < domains.length ? "inline-block" : "none";

  attachDeleteHandlers();
}

function attachDeleteHandlers() {
  document.querySelectorAll("#records button").forEach(btn => {
    btn.onclick = () => {
      const domain = btn.getAttribute("data-domain");
      chrome.runtime.sendMessage({ type: "clearDomain", domain }, () => {
        delete allRecords[domain];
        renderRecords();
      });
    };
  });
}

function loadData() {
  chrome.runtime.sendMessage("getAllRecords", records => {
    allRecords = records;
    displayed = Math.min(batchSize, Object.keys(allRecords).length);
    renderRecords();
  });
}

document.getElementById("loadMore").onclick = () => {
  displayed += batchSize;
  renderRecords();
};

document.getElementById("clearAll").onclick = () => {
  chrome.runtime.sendMessage("clearAll", () => {
    allRecords = {};
    displayed = 0;
    renderRecords();
  });
};

// Refresh every 1s
setInterval(loadData, 1000);
loadData();