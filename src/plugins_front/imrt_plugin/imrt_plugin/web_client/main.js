console.log("✅ IMRT web_client main.js chargé");

const STATUS_LABELS = {
    0: "INACTIVE",
    1: "QUEUED",
    2: "RUNNING",
    3: "SUCCESS",
    4: "ERROR",
    5: "CANCELED",
};

function getApiUrl(path) {
    return `/api/v1/${path}`;
}

async function apiGet(path) {
const response = await fetch(getApiUrl(path), {
    method: "GET",
    credentials: "include",
});

if (!response.ok) {
    throw new Error(`GET ${path} failed`);
}

return response.json();
}

async function apiPost(path) {
const response = await fetch(getApiUrl(path), {
    method: "POST",
    credentials: "include",
});

if (!response.ok) {
    throw new Error(`POST ${path} failed`);
}

return response.json();
}

function createPanel() {
if (document.getElementById("imrt-floating-panel")) {
    return;
}

const panel = document.createElement("div");
panel.id = "imrt-floating-panel";

panel.style.position = "fixed";
panel.style.right = "24px";
panel.style.bottom = "24px";
panel.style.width = "430px";
panel.style.maxHeight = "430px";
panel.style.overflow = "hidden";
panel.style.background = "white";
panel.style.border = "1px solid #d9d9d9";
panel.style.borderRadius = "10px";
panel.style.boxShadow = "0 6px 20px rgba(0,0,0,0.22)";
panel.style.zIndex = "999999";
panel.style.fontFamily = "Arial, sans-serif";

panel.innerHTML = `
    <div id="imrt-panel-header" style="
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    background: #fafafa;
    ">
    <strong style="font-size: 14px;">IMRT Jobs</strong>

    <div style="display: flex; gap: 6px;">
        <button id="imrt-start-test" style="
        padding: 5px 8px;
        background: #2f80ed;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        ">
        Lancer test
        </button>

        <button id="imrt-toggle-panel" style="
        padding: 5px 8px;
        background: #eee;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        ">
        Masquer
        </button>
    </div>
    </div>

    <div id="imrt-panel-body" style="
    padding: 12px;
    max-height: 360px;
    overflow-y: auto;
    ">
    Chargement...
    </div>
`;

document.body.appendChild(panel);

document.getElementById("imrt-start-test").addEventListener("click", startTestJob);
document.getElementById("imrt-toggle-panel").addEventListener("click", togglePanel);

refreshJobs();
window.setInterval(refreshJobs, 1000);
}

function togglePanel() {
const panel = document.getElementById("imrt-floating-panel");
const body = document.getElementById("imrt-panel-body");
const toggle = document.getElementById("imrt-toggle-panel");
const start = document.getElementById("imrt-start-test");

const isHidden = body.style.display === "none";

if (isHidden) {
    body.style.display = "block";
    start.style.display = "inline-block";
    panel.style.width = "430px";
    panel.style.maxHeight = "430px";
    toggle.innerText = "Masquer";
} else {
    body.style.display = "none";
    start.style.display = "none";
    panel.style.width = "180px";
    panel.style.maxHeight = "48px";
    toggle.innerText = "Afficher";
}
}

async function startTestJob() {
const button = document.getElementById("imrt-start-test");
button.disabled = true;
button.innerText = "...";

try {
    await apiPost("imrt_plugin/progress_test?n=10");
    await refreshJobs();
} catch (error) {
    console.error("Erreur lancement job IMRT:", error);
    alert("Erreur lancement job IMRT");
} finally {
    button.disabled = false;
    button.innerText = "Lancer test";
}
}

async function refreshJobs() {
const body = document.getElementById("imrt-panel-body");

if (!body) {
    return;
}

try {
    const jobs = await apiGet("imrt_plugin/jobs");

    if (!jobs || jobs.length === 0) {
    body.innerHTML = `
        <div style="font-size: 13px; color: #777;">
        Aucun job IMRT pour le moment.
        </div>
    `;
    return;
    }

    body.innerHTML = jobs.map(renderJob).join("");
} catch (error) {
    console.error("Erreur chargement jobs IMRT:", error);

    body.innerHTML = `
    <div style="font-size: 13px; color: #c0392b;">
        Impossible de charger les jobs IMRT.
    </div>
    `;
}
}

function renderJob(job) {
const percent = Math.max(0, Math.min(100, Number(job.progressPercent) || 0));
const status = STATUS_LABELS[job.status] || job.status;
const title = job.title || "Job IMRT";
const message = job.progressMessage || "";

let color = "#777";

if (job.status === 1) color = "#d6b72d";
if (job.status === 2) color = "#2f80ed";
if (job.status === 3) color = "#27ae60";
if (job.status === 4) color = "#c0392b";
if (job.status === 5) color = "#999";

return `
    <div style="padding: 10px 0; border-top: 1px solid #eee;">
    <div style="
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: center;
        margin-bottom: 6px;
    ">
        <a href="#job/${job.id}" style="
        color: #2f80ed;
        text-decoration: none;
        font-size: 13px;
        max-width: 250px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        " title="${title}">
        ${title}
        </a>

        <span style="
        color: white;
        background: ${color};
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        ">
        ${status}
        </span>
    </div>

    <div style="
        width: 100%;
        height: 22px;
        background: #eee;
        border-radius: 4px;
        overflow: hidden;
    ">
        <div style="
        width: ${percent}%;
        height: 100%;
        background: #2f80ed;
        color: white;
        text-align: center;
        line-height: 22px;
        transition: width 0.3s ease;
        font-size: 12px;
        font-weight: bold;
        ">
        ${percent}%
        </div>
    </div>

    <div style="
        margin-top: 5px;
        color: #666;
        font-size: 12px;
    ">
        ${message}
    </div>
    </div>
`;
}

function boot() {
console.log("✅ IMRT boot panel");

if (document.body) {
    createPanel();
} else {
    window.setTimeout(boot, 200);
}
}

boot();