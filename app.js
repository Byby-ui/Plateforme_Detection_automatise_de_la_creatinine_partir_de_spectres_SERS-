// --- GESTION DES ONGLETS DE NAVIGATION ---
function showTab(tabId) {
    document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`tab-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- INITIALISATION DU GRAPHIQUE CHARTS.JS ---
const ctx = document.getElementById('ramanChart').getContext('2d');
const wavenumbers = Array.from({length: 120}, (_, i) => 400 + i * 13.3); // 400 à 2000 cm-1

function generateSpectrumData(concValue) {
    const intensityFactor = concValue / 50;
    return wavenumbers.map(w => {
        let noise = (Math.random() - 0.5) * 15; // Bruit de fond du capteur
        let base = 20 + noise;

        // Insertion des 4 pics caractéristiques de la créatinine (604, 673, 836, 901 cm-1)
        if (Math.abs(w - 604) < 20) base += 250 * intensityFactor;
        if (Math.abs(w - 673) < 20) base += 210 * intensityFactor;
        if (Math.abs(w - 836) < 20) base += 110 * intensityFactor;
        if (Math.abs(w - 901) < 20) base += 90 * intensityFactor;

        return Math.max(0, base);
    });
}

const ramanChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: wavenumbers.map(w => Math.round(w)),
        datasets: [{
            label: 'Intensité Raman SERS (a.u.)',
            data: generateSpectrumData(50),
            borderColor: '#0284c7',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            backgroundColor: 'rgba(2, 132, 199, 0.05)',
            tension: 0.2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { title: { display: true, text: 'Raman Shift (cm⁻¹)' } },
            y: { title: { display: true, text: 'Intensité Exaltée (a.u.)' }, min: 0 }
        }
    }
});

// --- ANIMATION CANVAS 2D DU BIOCAPTEUR GOAu ---
const canvas = document.getElementById('sensorCanvas');
const c = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
resizeCanvas();

// Particules physiques
let goldNPs = [];
let molecules = [];

function initPhysics() {
    goldNPs = [];
    molecules = [];
    // Génération des Nanoparticules d'Or (~60nm)
    for(let i = 0; i < 8; i++) {
        goldNPs.push({
            x: (canvas.width / 9) * (i + 1),
            y: canvas.height - 40,
            r: 15
        });
    }
    // Génération des Molécules de Créatinine
    for(let i = 0; i < 25; i++) {
        molecules.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 80),
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 1 + 0.5
        });
    }
}
initPhysics();

function drawSensorAnimation() {
    c.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Feuille d'Oxyde de Graphène (Base)
    c.fillStyle = '#334155';
    c.fillRect(0, canvas.height - 25, canvas.width, 25);
    c.fillStyle = '#94a3b8';
    c.font = '10px sans-serif';
    c.fillText('Wafer Silicium / Feuillets GO (Oxyde de Graphène)', 10, canvas.height - 8);

    // 2. Nanoparticules d'Or (AuNPs ~60nm) avec Effet Plasmonique
    goldNPs.forEach(np => {
        c.beginPath();
        c.arc(np.x, np.y, np.r, 0, Math.PI * 2);
        c.fillStyle = '#eab308';
        c.fill();
        c.shadowColor = '#eab308';
        c.shadowBlur = 10;
    });
    c.shadowBlur = 0; // Reset ombre

    // 3. Déplacement des Molécules de Créatinine
    molecules.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;

        if (m.y > canvas.height - 50) m.y = 10;
        if (m.x < 0 || m.x > canvas.width) m.vx *= -1;

        c.beginPath();
        c.arc(m.x, m.y, 4, 0, Math.PI * 2);
        c.fillStyle = '#38bdf8';
        c.fill();
    });

    requestAnimationFrame(drawSensorAnimation);
}
drawSensorAnimation();

// --- MISE À JOUR DE LA SIMULATION EN TEMPS RÉEL ---
function updateSimulation() {
    const val = document.getElementById('concSlider').value;
    document.getElementById('concDisplay').innerText = val + " µM";

    // Update Chart.js
    ramanChart.data.datasets[0].data = generateSpectrumData(val);
    ramanChart.update();

    // Update IA & Diagnostic Médical
    const badge = document.getElementById('statusBadge');
    const text = document.getElementById('diagText');

    if (val > 80) {
        badge.className = "status-badge danger";
        badge.innerText = "Risque Élevé : Anomalie Rénale (CKD)";
        text.innerText = "Le réseau de neurones (FFN) a identifié une hypercréatininémie. Biomarqueurs affectés : MT1A, SOD1.";
    } else {
        badge.className = "status-badge normal";
        badge.innerText = "Fonction Rénale Normale";
        text.innerText = "Profil spectroscopique conforme aux seuils physiologiques sains (44-106 µM).";
    }
}

// Flash Laser au clic
function triggerPulse() {
    const laser = document.getElementById('laserBeam');
    laser.style.opacity = '1';
    setTimeout(() => { laser.style.opacity = '0'; }, 1500);
}