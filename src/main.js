// GSAP and ScrollTrigger loaded via CDN
gsap.registerPlugin(ScrollTrigger);

// --- Configuration ---
const config = {
    frameCount: 96,
    // Scrub value: The amount of time (in seconds) that the playhead takes to catch up to the scrollbar.
    // 0.5 gives a nice "weighty" feel (intertia/damping).
    scrubSensitivity: 0.5,
};

// --- State ---
const state = {
    images: [],
    loadedCount: 0,
};

const spider = {
    frame: 0
};

// --- Elements ---
const canvas = document.getElementById('bg-canvas');
const context = canvas.getContext('2d');
const heroSection = document.querySelector('.hero-section');
const heroTitle = document.querySelector('.hero-overlay h1');
const techFrames = document.querySelectorAll('.tech-frame-tl, .tech-frame-tr, .tech-frame-bl, .tech-frame-br');

// --- Helper Functions ---
const getFramePath = (index) => `assets/frames/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`;

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (state.loadedCount === config.frameCount) {
        render();
    }
};

const render = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Clamp frame index
    let frameIndex = Math.round(spider.frame);
    if (frameIndex >= config.frameCount) frameIndex = config.frameCount - 1;
    if (frameIndex < 0) frameIndex = 0;

    const img = state.images[frameIndex];
    if (!img) return;

    // --- Scale Logic: CONTAIN (No Cropping) ---
    // We want the image to fit entirely within the viewport.
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
        // Window is wider than image (Landscape) -> constrained by height
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetY = 0;
        offsetX = (canvas.width - drawWidth) / 2; // Center horizontally
    } else {
        // Window is taller than image (Portrait) -> constrained by width
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2; // Center vertically
    }

    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
};

// --- Initialization ---
const init = () => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Preload
    const promises = [];
    for (let i = 1; i <= config.frameCount; i++) {
        const p = new Promise((resolve) => {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                state.loadedCount++;
                resolve();
            };
            state.images.push(img);
        });
        promises.push(p);
    }

    Promise.all(promises).then(() => {
        // Start rendering initially
        render();

        // Setup ScrollTrigger once images are ready
        ScrollTrigger.refresh();
    });

    // --- GSAP ScrollTrigger ---
    // The canvas is fixed, but we want to pin the hero section content
    // and hold it there while we scrub through the frames.

    gsap.to(spider, {
        frame: config.frameCount - 1,
        snap: "frame", // snapping to integer frames is good for performance
        ease: "none", // Linear interpolation as requested
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top", // Start when hero hits top
            end: "+=3000", // Scroll distance (3000px) determines speed/duration
            pin: true, // Pin the container
            scrub: config.scrubSensitivity, // Inertia/Damping
            marker: false,
            onUpdate: render
        }
    });

    // 3D Tilt Setup
    setupTiltEffect();

    // Contact Form Setup
    setupContactForm();

    // Quote Ticker Setup
    setupTypewriter();

    // --- Developer Terminal Filter & Quick-View Modal Logic ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.terminal-card');
    const modal = document.getElementById('quick-view-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalDetails = document.getElementById('modal-details');

    // Data Map for Quick-View Modal
    const modalData = {
        'all': {
            title: 'ALL DATA // Overview',
            desc: 'A comprehensive overview of my technical journey.',
            details: [
                { label: 'Highlights', text: 'Integrated view of all 20+ hardware and software repositories, including my 12-DOF Quadruped and Solidity Suite.' }
            ]
        },
        'architecture': {
            title: 'ARCHITECTURE // Hardware & Physics',
            desc: 'Focusing on the physical layer of engineering and circuit precision.',
            details: [
                { label: 'Current Projects', text: '12-DOF Quadruped "Mochi" (PCA9685/ESP32 hardware), Seven-Segment Counter, and Custom PCB Night Lamp.' },
                { label: 'Upcoming', text: 'Refinement of sunboard chassis durability and power distribution efficiency.' }
            ]
        },
        'web3': {
            title: 'WEB3 & BITCOIN // Decentralized Logic',
            desc: 'Building secure, decentralized financial logic.',
            details: [
                { label: 'Current Projects', text: 'Solidity Practice Suite featuring vaultaccess.sol, splitter.sol, and withdrawl.sol.' },
                { label: 'Upcoming', text: 'Developing a Real-World Asset (RWA) Fractional Investment Engine on Bitcoin Layer 2s.' }
            ]
        },
        'ai': {
            title: 'AI SYSTEMS // Intelligent Automation',
            desc: 'Exploring automation and intelligent hardware interfaces.',
            details: [
                { label: 'Current Projects', text: 'Samsung M21 Linux Server (Termux/n8n) and ESP32-CAM visual diagnostic server.' },
                { label: 'Upcoming', text: 'Integrating MPU-6050 motion data with AI-driven gait correction for robotics.' }
            ]
        },
        'research': {
            title: 'RESEARCH // Innovation & Certs',
            desc: 'Academic-level technical exploration and innovation.',
            details: [
                { label: 'Current Projects', text: 'Hardware-side collaboration on Carotid Ultrasonic Imaging and MOZOVATE Top-8 Team innovation.' },
                { label: 'Accolades', text: 'Certified in Digital Logic Design and Python Master programs.' }
            ]
        }
    };

    let activeFilter = 'all'; // Track active filter state

    // Function to open modal
    const openModal = (category) => {
        const data = modalData[category];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalDesc.textContent = data.desc;

        // Build details HTML
        modalDetails.innerHTML = data.details.map(item => `
            <div class="modal-detail-item">
                <span class="modal-detail-label">${item.label}</span>
                <span class="modal-detail-text">${item.text}</span>
            </div>
        `).join('');

        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
    };

    // Function to close modal
    const closeModal = () => {
        modal.classList.remove('modal-visible');
        modal.classList.add('modal-hidden');
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from closing immediately

            const filterValue = btn.getAttribute('data-filter');

            // Toggle Logic: If clicking active button, toggle modal
            if (btn.classList.contains('active')) {
                if (modal.classList.contains('modal-visible')) {
                    closeModal();
                } else {
                    openModal(filterValue);
                }
            } else {
                // New category selected
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = filterValue;

                // Filter Grid
                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category');
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        gsap.to(card, { autoAlpha: 1, display: 'block', duration: 0.4, ease: "power2.out" });
                    } else {
                        gsap.to(card, { autoAlpha: 0, display: 'none', duration: 0.3, ease: "power2.in" });
                    }
                });
                ScrollTrigger.refresh();

                // Open modal for new selection
                openModal(filterValue);
            }
        });
    });

    // Data-category hover effect for buttons (Optional, but keeps UI alive)
    // Close modal on outside click
    document.addEventListener('click', (e) => {
        if (!modal.contains(e.target) && !e.target.closest('.filter-btn')) {
            closeModal();
        }
    });

    // Initialize with 'all' but modal closed or open? 
    // "When a user clicks... box must appear". Implies initially closed.
    // Ensure active state persists.
};

const setupTiltEffect = () => {
    if (heroSection && heroTitle) {
        heroSection.addEventListener('mousemove', (e) => {
            const xPos = (e.clientX / window.innerWidth - 0.5) * 2;
            const yPos = (e.clientY / window.innerHeight - 0.5) * 2;

            gsap.to(heroTitle, {
                duration: 0.5,
                rotationY: xPos * 20,
                rotationX: -yPos * 20,
                transformPerspective: 900,
                ease: "power2.out",
                overwrite: "auto"
            });

            if (techFrames.length > 0) {
                gsap.to(techFrames, {
                    duration: 1,
                    x: -xPos * 30,
                    y: -yPos * 30,
                    ease: "power2.out"
                });
            }
        });

        heroSection.addEventListener('mouseleave', () => {
            gsap.to(heroTitle, { duration: 1, rotationY: 0, rotationX: 0, ease: "power2.out" });
            if (techFrames.length > 0) {
                gsap.to(techFrames, { duration: 1, x: 0, y: 0, ease: "power2.out" });
            }
        });
    }
}

const setupContactForm = () => {
    // Check if emailjs is loaded
    if (typeof emailjs === 'undefined') {
        console.warn("EmailJS not loaded.");
        return;
    }

    // Initialize EmailJS with your Public Key
    // USER: Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS Public Key
    emailjs.init({
        publicKey: "L_uBgNPHffU-4jey7",
    });

    const contactForm = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            // USER: Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS IDs
            emailjs.sendForm('service_us1anmh', 'template_4xnext7', this)
                .then(() => {
                    statusMsg.style.display = 'block';
                    statusMsg.style.color = '#00ff9d'; // Neon green success
                    statusMsg.textContent = 'Message Sent Successfully!';
                    btn.textContent = 'Sent';
                    contactForm.reset();

                    setTimeout(() => {
                        statusMsg.style.display = 'none';
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 5000);
                }, (error) => {
                    console.error('FAILED...', error);
                    statusMsg.style.display = 'block';
                    statusMsg.style.color = '#ff4d4d'; // Red error
                    statusMsg.textContent = 'Failed to send. Please try again.';
                    btn.textContent = originalText;
                    btn.disabled = false;
                });
        });
    }
};


const setupTypewriter = () => {
    const container = document.getElementById('typewriter-quote-container');

    if (!container || typeof Typewriter === 'undefined') return;

    const typewriter = new Typewriter(container, {
        loop: true,
        delay: 50,
        deleteSpeed: 30,
        wrapperClassName: 'typewriter-glow'
    });

    typewriter
        .typeString('The best way to predict the future is to invent it. <span class="opacity-50">— Alan Kay</span>')
        .pauseFor(3000)
        .deleteAll()
        .typeString('The main event isn\'t even Bitcoin. It\'s the world getting a new way to trust. <span class="opacity-50">— Vitalik Buterin</span>')
        .pauseFor(3000)
        .deleteAll()
        .typeString('Data is the new oil, but IoT is the drill.')
        .pauseFor(3000)
        .deleteAll()
        .typeString('Anything that can be connected, will be connected. <span class="opacity-50">— Hans Vestberg</span>')
        .pauseFor(3000)
        .deleteAll()
        .start();
};

init();
