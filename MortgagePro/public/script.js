/**
 * Custom Cursor Logic
 */
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    const follower = document.createElement('div');
    follower.id = 'custom-cursor-follower';
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
        follower.style.left = `${x}px`;
        follower.style.top = `${y}px`;
    });

    document.querySelectorAll('a, button, input, .feature-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
            follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.background = 'rgba(139, 92, 246, 0.8)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.background = 'var(--primary)';
        });
    });
}

/**
 * 3D Background Logic (Three.js)
 */
function init3DBackground() {
    const container = document.getElementById('three-bg-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // High-end Morphing Sphere
    const geometry = new THREE.IcosahedronGeometry(15, 4);
    const material = new THREE.MeshPhongMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Inner Glow Sphere
    const innerGeometry = new THREE.IcosahedronGeometry(14.8, 4);
    const innerMaterial = new THREE.MeshPhongMaterial({
        color: 0xec4899,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerSphere);

    // Lights
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(20, 20, 20);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 40;

    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / 100;
        mouseY = (e.clientY - window.innerHeight / 2) / 100;
    });

    const originalVertices = geometry.attributes.position.array.slice();

    function animate(time) {
        requestAnimationFrame(animate);

        // Morphing Effect
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = originalVertices[i];
            const y = originalVertices[i + 1];
            const z = originalVertices[i + 2];

            const offset = time * 0.001;
            const noise = Math.sin(x * 0.1 + offset) * Math.cos(y * 0.1 + offset) * 2;

            positions[i] = x + noise;
            positions[i + 1] = y + noise;
            positions[i + 2] = z + noise;
        }
        geometry.attributes.position.needsUpdate = true;

        sphere.rotation.y += 0.002;
        sphere.rotation.x += 0.001;
        innerSphere.rotation.y -= 0.003;

        sphere.position.x += (mouseX - sphere.position.x) * 0.05;
        sphere.position.y += (-mouseY - sphere.position.y) * 0.05;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate(0);
}

/**
 * Charts Management
 */
let emiChart = null;
let prepayChart = null;

function updateEMIChart(principal, interest) {
    const chartEl = document.getElementById('emiChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');
    if (emiChart) emiChart.destroy();

    emiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#8b5cf6', '#ec4899'],
                borderWidth: 0,
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12, weight: '500' } } }
            },
            cutout: '75%'
        }
    });
}

function updatePrepayChart(origInterest, newInterest) {
    const chartEl = document.getElementById('prepayChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');
    if (prepayChart) prepayChart.destroy();

    prepayChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Original', 'Optimized'],
            datasets: [{
                label: 'Total Interest Payable',
                data: [origInterest, newInterest],
                backgroundColor: ['rgba(255,255,255,0.05)', '#8b5cf6'],
                borderRadius: 15,
                barThickness: 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Form Handlers
 */
function initForms() {
    // EMI Form
    const emiForm = document.getElementById('emi-form');
    if (emiForm) {
        emiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                loanAmount: document.getElementById('loanAmount').value,
                interestRate: document.getElementById('interestRate').value,
                tenureYears: document.getElementById('tenureYears').value
            };

            try {
                const res = await fetch('/api/calculate-emi', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                document.getElementById('emi-results').style.display = 'block';
                document.getElementById('res-emi').innerText = `$${parseFloat(result.monthlyEmi).toLocaleString()}`;
                document.getElementById('res-interest').innerText = `$${parseFloat(result.totalInterest).toLocaleString()}`;
                document.getElementById('res-total').innerText = `$${parseFloat(result.totalPayment).toLocaleString()}`;

                updateEMIChart(result.principal, result.totalInterest);
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Rent vs Buy Form
    const rentForm = document.getElementById('rent-form');
    if (rentForm) {
        rentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                monthlyRent: document.getElementById('monthlyRent').value,
                propertyPrice: document.getElementById('propertyPrice').value,
                years: document.getElementById('rentYears').value,
                appreciation: document.getElementById('appreciation').value
            };

            try {
                const res = await fetch('/api/buy-vs-rent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                document.getElementById('rent-results').style.display = 'block';
                document.getElementById('res-total-rent').innerText = `$${parseFloat(result.totalRentPaid).toLocaleString()}`;
                document.getElementById('res-future-val').innerText = `$${parseFloat(result.futureValue).toLocaleString()}`;
                document.getElementById('res-rent-suggestion').innerText = result.suggestion;
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Prepayment Form
    const prepayForm = document.getElementById('prepay-form');
    if (prepayForm) {
        prepayForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                loanAmount: document.getElementById('p-loanAmount').value,
                interestRate: document.getElementById('p-interestRate').value,
                tenureYears: document.getElementById('p-tenureYears').value,
                extraMonthly: document.getElementById('extraMonthly').value
            };

            try {
                const res = await fetch('/api/prepayment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                document.getElementById('prepay-results').style.display = 'block';
                document.getElementById('res-savings').innerText = `$${parseFloat(result.interestSavings).toLocaleString()}`;
                document.getElementById('res-new-tenure').innerText = `${result.newTenureMonths} months`;
                document.getElementById('orig-interest').innerText = `$${parseFloat(result.originalTotalInterest).toLocaleString()}`;
                document.getElementById('new-interest').innerText = `$${parseFloat(result.newTotalInterest).toLocaleString()}`;

                updatePrepayChart(result.originalTotalInterest, result.newTotalInterest);
            } catch (err) {
                console.error(err);
            }
        });
    }
}

/**
 * AI Advisor Logic
 */
function initChat() {
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input').value;
            const chatBox = document.getElementById('chat-box');

            const userDiv = document.createElement('div');
            userDiv.className = 'user-msg';
            userDiv.innerText = input;
            chatBox.appendChild(userDiv);

            let botResponse = "I'm not sure about that. Try asking about EMI, renting, or prepayment!";
            const query = input.toLowerCase();

            if (query.includes('emi')) {
                botResponse = "EMI is your Equated Monthly Installment. It covers both principal and interest repayments.";
            } else if (query.includes('rent') || query.includes('buy')) {
                botResponse = "Buying is often better if you plan to stay long-term and property value grows faster than rent costs.";
            } else if (query.includes('prepayment')) {
                botResponse = "Prepayments target your principal directly, saving massive amounts in long-term interest.";
            }

            setTimeout(() => {
                const botDiv = document.createElement('div');
                botDiv.className = 'bot-msg';
                botDiv.innerText = botResponse;
                chatBox.appendChild(botDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 600);

            document.getElementById('chat-input').value = '';
        });
    }
}

// Initialize on load
window.addEventListener('load', () => {
    init3DBackground();
    initCustomCursor();
    initForms();
    initChat();
});
