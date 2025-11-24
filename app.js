// ===== ALGORITHM DEFINITIONS =====
// (Keep the ALGORITHMS array exactly as it is in your original file. 
//  I am omitting it here for brevity, but ensure it is included at the top of the file.)
const ALGORITHMS = [
    {
        id: 'ascii_weaver',
        name: 'ASCII Weaver',
        description: 'Transforms text into color through character code mathematics. Each letter contributes to RGB channels using sum, product, and XOR operations.',
        inputs: [
            { id: 'text', label: 'Input Text', type: 'text', value: 'Hello World' },
            { id: 'intensity', label: 'Intensity', type: 'range', min: 0.5, max: 3, value: 1.5, step: 0.1 }
        ],
        compute: (params) => {
            const text = params.text || '';
            if (text.length === 0) return { r: 0, g: 0, b: 0 };
            let sum = 0, product = 1, xor = 0;
            for (let i = 0; i < text.length; i++) {
                const code = text.charCodeAt(i);
                sum += code;
                product = (product * (code / 10)) % 255;
                xor ^= code;
            }
            const r = (Math.sin(sum / 30) * 127 + 128) * params.intensity;
            const g = (product * params.intensity * 1.2) % 255;
            const b = (xor * params.intensity * 1.5) % 255;
            return { r, g, b };
        }
    },
    {
        id: 'fluorescent_hum',
        name: 'Fluorescent Hum',
        description: 'Simulates the characteristic color temperature of aging fluorescent lighting with adjustable flicker frequency and monitor glare.',
        inputs: [
            { id: 'kelvin', label: 'Temperature (K)', type: 'range', min: 2700, max: 6500, value: 4100, step: 100 },
            { id: 'age', label: 'Bulb Age (years)', type: 'range', min: 0, max: 25, value: 10, step: 1 },
            { id: 'flicker', label: 'Flicker (Hz)', type: 'range', min: 50, max: 120, value: 60, step: 10 },
            { id: 'glare', label: 'Screen Glare', type: 'range', min: 0, max: 100, value: 80, step: 5 }
        ],
        compute: (params) => {
            let r, g, b;
            if (params.kelvin < 5000) {
                r = 255;
                g = 200 + ((params.kelvin - 2700) / 2300) * 55;
                b = 150 + ((params.kelvin - 2700) / 2300) * 105;
            } else {
                r = 255 - ((params.kelvin - 5000) / 1500) * 40;
                g = 255;
                b = 255;
            }
            g += 18;
            const degradation = params.age * 2.5;
            r = Math.max(0, r - degradation * 0.5);
            b = Math.max(0, b - degradation);
            g = Math.min(255, g + degradation * 0.3);
            const flickerIntensity = params.flicker / 60;
            const time = Date.now() / 1000;
            const flickerModulation = 1 + Math.sin(time * params.flicker * Math.PI * 2) * 0.02 * flickerIntensity;
            r *= flickerModulation; g *= flickerModulation; b *= flickerModulation;
            const glareAmount = params.glare / 2;
            r = Math.min(255, r + glareAmount);
            g = Math.min(255, g + glareAmount);
            b = Math.min(255, b + glareAmount);
            return { r, g, b };
        }
    },
    {
        id: 'wave_interference',
        name: 'Wave Interference',
        description: 'Models color as overlapping sine waves with variable frequency, phase, and amplitude creating complex interference patterns.',
        inputs: [
            { id: 'freq_r', label: 'Red Frequency', type: 'range', min: 0.1, max: 5, value: 1, step: 0.1 },
            { id: 'freq_g', label: 'Green Frequency', type: 'range', min: 0.1, max: 5, value: 1.7, step: 0.1 },
            { id: 'freq_b', label: 'Blue Frequency', type: 'range', min: 0.1, max: 5, value: 2.3, step: 0.1 },
            { id: 'phase', label: 'Phase Shift', type: 'range', min: 0, max: 360, value: 0, step: 1 }
        ],
        compute: (params) => {
            const time = Date.now() / 1000;
            const phaseRad = (params.phase * Math.PI) / 180;
            const r = (Math.sin(time * params.freq_r + phaseRad) * 127 + 128);
            const g = (Math.sin(time * params.freq_g + phaseRad + Math.PI / 3) * 127 + 128);
            const b = (Math.sin(time * params.freq_b + phaseRad + (2 * Math.PI) / 3) * 127 + 128);
            return { r, g, b };
        }
    },
    {
        id: 'atmospheric_depth',
        name: 'Atmospheric Depth',
        description: 'Simulates how atmosphere affects color at different altitudes and times of day using Rayleigh scattering principles.',
        inputs: [
            { id: 'altitude', label: 'Altitude (km)', type: 'range', min: 0, max: 100, value: 0, step: 1 },
            { id: 'sun_angle', label: 'Sun Angle (°)', type: 'range', min: -90, max: 90, value: 45, step: 1 },
            { id: 'particles', label: 'Particulate Density', type: 'range', min: 0, max: 100, value: 30, step: 5 }
        ],
        compute: (params) => {
            let r = 135, g = 206, b = 235;
            const altitudeFactor = 1 - (params.altitude / 100);
            r *= altitudeFactor; g *= altitudeFactor * 0.9;
            const sunRad = (params.sun_angle * Math.PI) / 180;
            const scatterFactor = Math.max(0, Math.sin(sunRad));
            if (params.sun_angle < 10 && params.sun_angle > -10) {
                r = 255; g = 150 + scatterFactor * 100; b = 50 + scatterFactor * 100;
            } else if (params.sun_angle < -10) {
                r = 10; g = 15; b = 40 + params.altitude * 0.5;
            } else {
                r += (255 - r) * (1 - scatterFactor) * 0.3; g *= (0.7 + scatterFactor * 0.3);
            }
            const haze = params.particles / 100;
            r += haze * 50; g += haze * 40; b -= haze * 30;
            return { r, g, b };
        }
    },
    {
        id: 'quantum_noise',
        name: 'Quantum Noise',
        description: 'Generates pseudo-random color noise using multiple overlapping random number generators with seed-based periodicity.',
        inputs: [
            { id: 'seed', label: 'Seed Value', type: 'range', min: 0, max: 1000, value: 42, step: 1 },
            { id: 'chaos', label: 'Chaos Factor', type: 'range', min: 1, max: 10, value: 5, step: 1 },
            { id: 'speed', label: 'Evolution Speed', type: 'range', min: 0.1, max: 5, value: 1, step: 0.1 }
        ],
        compute: (params) => {
            const time = Date.now() / 1000 * params.speed;
            const noise1 = Math.sin(params.seed * 12.9898 + time) * 43758.5453;
            const noise2 = Math.sin(params.seed * 78.233 + time * 1.3) * 19134.3232;
            const noise3 = Math.sin(params.seed * 45.164 + time * 0.7) * 56789.1234;
            const r = ((noise1 - Math.floor(noise1)) * 255 * params.chaos / 5);
            const g = ((noise2 - Math.floor(noise2)) * 255 * params.chaos / 5);
            const b = ((noise3 - Math.floor(noise3)) * 255 * params.chaos / 5);
            return { r, g, b };
        }
    },
    {
        id: 'chemical_reaction',
        name: 'Chemical Reaction',
        description: 'Models color changes during a chemical reaction using temperature, pH, and concentration parameters.',
        inputs: [
            { id: 'temperature', label: 'Temperature (°C)', type: 'range', min: -50, max: 300, value: 25, step: 5 },
            { id: 'ph', label: 'pH Level', type: 'range', min: 0, max: 14, value: 7, step: 0.1 },
            { id: 'concentration', label: 'Concentration', type: 'range', min: 0, max: 100, value: 50, step: 1 }
        ],
        compute: (params) => {
            let r, g, b;
            if (params.ph < 4) { r = 255; g = 50; b = 50; }
            else if (params.ph < 6) { r = 255; g = 150 + (params.ph - 4) * 52.5; b = 50; }
            else if (params.ph < 8) { r = 100; g = 200; b = 100; }
            else if (params.ph < 11) { r = 50; g = 100 + (11 - params.ph) * 33; b = 200; }
            else { r = 150; g = 50; b = 255; }
            const tempFactor = 0.5 + Math.min(1, (params.temperature + 50) / 350);
            r *= tempFactor; g *= tempFactor; b *= tempFactor;
            const concFactor = params.concentration / 100;
            const gray = (r + g + b) / 3;
            r = gray + (r - gray) * concFactor;
            g = gray + (g - gray) * concFactor;
            b = gray + (b - gray) * concFactor;
            return { r, g, b };
        }
    },
    {
        id: 'doppler_shift',
        name: 'Doppler Shift',
        description: 'Simulates the color shift of light from objects moving at relativistic speeds using the Doppler effect.',
        inputs: [
            { id: 'velocity', label: 'Velocity (% speed of light)', type: 'range', min: -99, max: 99, value: 0, step: 1 },
            { id: 'base_wavelength', label: 'Base Wavelength (nm)', type: 'range', min: 380, max: 750, value: 550, step: 10 },
            { id: 'intensity', label: 'Intensity', type: 'range', min: 0.1, max: 2, value: 1, step: 0.1 }
        ],
        compute: (params) => {
            const beta = params.velocity / 100;
            const gamma = 1 / Math.sqrt(1 - beta * beta);
            const doppler_factor = gamma * (1 - beta);
            let wavelength = params.base_wavelength / doppler_factor;
            wavelength = Math.max(380, Math.min(750, wavelength));
            let r, g, b;
            if (wavelength < 440) { r = -(wavelength - 440) / (440 - 380); g = 0; b = 1; }
            else if (wavelength < 490) { r = 0; g = (wavelength - 440) / (490 - 440); b = 1; }
            else if (wavelength < 510) { r = 0; g = 1; b = -(wavelength - 510) / (510 - 490); }
            else if (wavelength < 580) { r = (wavelength - 510) / (580 - 510); g = 1; b = 0; }
            else if (wavelength < 645) { r = 1; g = -(wavelength - 645) / (645 - 580); b = 0; }
            else { r = 1; g = 0; b = 0; }
            let factor = 1;
            if (wavelength < 420) factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
            else if (wavelength > 700) factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
            r *= factor * params.intensity * 255; g *= factor * params.intensity * 255; b *= factor * params.intensity * 255;
            return { r, g, b };
        }
    }
];

// ===== APPLICATION STATE =====

class ColorLab {
    constructor() {
        this.activeAlgorithm = null;
        this.animationFrame = null;
        this.frameCount = 0;
        this.parameters = {};
        
        this.initializeElements();
        this.initializeEventListeners();
        this.startClock();
        this.renderAlgorithmList();
        
        // Load state from URL immediately after rendering
        this.handleURLParams();
    }

    initializeElements() {
        this.elements = {
            algorithmList: document.getElementById('algorithmList'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            laboratoryScreen: document.getElementById('laboratoryScreen'),
            algorithmTitle: document.getElementById('algorithmTitle'),
            algorithmDescription: document.getElementById('algorithmDescription'),
            controlsContainer: document.getElementById('controlsContainer'),
            colorPreview: document.getElementById('colorPreview'),
            colorValue: document.getElementById('colorValue'),
            copyButton: document.getElementById('copyButton'),
            frameCounter: document.getElementById('frameCounter'),
            systemClock: document.getElementById('systemClock')
        };
    }

    initializeEventListeners() {
        this.elements.copyButton.addEventListener('click', () => this.copyColorValue());
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleURLParams();
        });
    }

    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 1. Handle Fullscreen
        if (urlParams.has('fullscreen')) {
            document.body.classList.add('is-fullscreen');
        } else {
            document.body.classList.remove('is-fullscreen');
        }

        // 2. Handle Algorithm Selection
        const gamutId = urlParams.get('gamut');
        
        if (gamutId) {
            const algoIndex = ALGORITHMS.findIndex(a => a.id === gamutId);
            if (algoIndex !== -1) {
                // Determine parameters from URL or fall back to defaults
                const targetAlgorithm = ALGORITHMS[algoIndex];
                const newParams = {};

                targetAlgorithm.inputs.forEach(input => {
                    const paramValue = urlParams.get(input.id);
                    if (paramValue !== null) {
                        // Type conversion
                        if (input.type === 'text') {
                            newParams[input.id] = paramValue;
                        } else {
                            newParams[input.id] = parseFloat(paramValue);
                        }
                    } else {
                        newParams[input.id] = input.value;
                    }
                });

                // Load algorithm with these specific parameters
                this.loadAlgorithm(algoIndex, newParams);
            }
        } else if (this.activeAlgorithm) {
            // If we navigated back to root/empty, return to welcome screen
            this.stopAnimation();
            this.activeAlgorithm = null;
            this.elements.welcomeScreen.classList.add('active');
            this.elements.laboratoryScreen.classList.remove('active');
            
            // Clear active buttons
            const buttons = this.elements.algorithmList.querySelectorAll('.algorithm-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
        }
    }

    updateURL() {
        if (!this.activeAlgorithm) return;

        const url = new URL(window.location);
        
        // Check if we are currently in fullscreen mode
        const isFullscreen = document.body.classList.contains('is-fullscreen');

        // Create a FRESH set of parameters to avoid stacking old ones
        const newParams = new URLSearchParams();

        // 1. Set the active gamut
        newParams.set('gamut', this.activeAlgorithm.id);

        // 2. Add ONLY the parameters relevant to the current algorithm
        for (const [key, value] of Object.entries(this.parameters)) {
            newParams.set(key, value);
        }

        // 3. Re-apply fullscreen flag if necessary
        if (isFullscreen) {
            newParams.set('fullscreen', '');
        }

        // Replace the search string entirely
        url.search = newParams.toString();

        // Update browser URL without reloading
        window.history.replaceState({}, '', url);
    }

    startClock() {
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            this.elements.systemClock.textContent = timeString;
        }, 1000);
    }

    renderAlgorithmList() {
        this.elements.algorithmList.innerHTML = '';
        
        ALGORITHMS.forEach((algorithm, index) => {
            const button = document.createElement('button');
            button.className = 'algorithm-btn';
            button.textContent = algorithm.name;
            button.addEventListener('click', () => {
                // When clicking menu, load defaults
                const defaults = {};
                algorithm.inputs.forEach(inp => defaults[inp.id] = inp.value);
                this.loadAlgorithm(index, defaults);
                
                // Remove fullscreen on manual navigation if desired, 
                // or keep it. Here we remove it to show controls.
                document.body.classList.remove('is-fullscreen');
                this.updateURL();
            });
            this.elements.algorithmList.appendChild(button);
        });
    }

    // Modified to accept optional params object
    loadAlgorithm(index, customParams = null) {
        this.activeAlgorithm = ALGORITHMS[index];
        
        // Update active button state
        const buttons = this.elements.algorithmList.querySelectorAll('.algorithm-btn');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        // Switch screens
        this.elements.welcomeScreen.classList.remove('active');
        this.elements.laboratoryScreen.classList.add('active');

        // Update header
        this.elements.algorithmTitle.textContent = this.activeAlgorithm.name;
        this.elements.algorithmDescription.textContent = this.activeAlgorithm.description;

        // Initialize parameters (Use customParams if provided, otherwise defaults)
        this.parameters = customParams || {};
        if (!customParams) {
            this.activeAlgorithm.inputs.forEach(input => {
                this.parameters[input.id] = input.value;
            });
        }

        // Render controls
        this.renderControls();

        // Start animation loop
        this.stopAnimation();
        this.startAnimation();
    }

    renderControls() {
        this.elements.controlsContainer.innerHTML = '';

        this.activeAlgorithm.inputs.forEach(input => {
            const group = document.createElement('div');
            group.className = 'control-group';

            // Use current parameter value, fallback to default
            const currentValue = this.parameters[input.id] !== undefined ? this.parameters[input.id] : input.value;

            const label = document.createElement('div');
            label.className = 'control-label';
            label.innerHTML = `
                <span>${input.label}</span>
                <span class="control-value" id="value-${input.id}">
                    ${input.type === 'range' ? parseFloat(currentValue).toFixed(input.step < 1 ? 1 : 0) : currentValue}
                </span>
            `;

            let inputElement;
            
            if (input.type === 'text') {
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = currentValue;
            } else if (input.type === 'range') {
                inputElement = document.createElement('input');
                inputElement.type = 'range';
                inputElement.min = input.min;
                inputElement.max = input.max;
                inputElement.value = currentValue;
                inputElement.step = input.step || 1;
            } else if (input.type === 'number') {
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.min = input.min;
                inputElement.max = input.max;
                inputElement.value = currentValue;
            }

            inputElement.addEventListener('input', (e) => {
                const value = input.type === 'text' ? e.target.value : parseFloat(e.target.value);
                this.parameters[input.id] = value;
                
                const valueDisplay = document.getElementById(`value-${input.id}`);
                if (valueDisplay) {
                    valueDisplay.textContent = input.type === 'range' ? value.toFixed(input.step < 1 ? 1 : 0) : value;
                }

                // Update URL whenever a value changes
                this.updateURL();
            });

            group.appendChild(label);
            group.appendChild(inputElement);
            this.elements.controlsContainer.appendChild(group);
        });
    }

    startAnimation() {
        const animate = () => {
            if (!this.activeAlgorithm) return;

            const result = this.activeAlgorithm.compute(this.parameters);
            
            const r = Math.max(0, Math.min(255, Math.round(result.r)));
            const g = Math.max(0, Math.min(255, Math.round(result.g)));
            const b = Math.max(0, Math.min(255, Math.round(result.b)));

            const colorString = `rgb(${r}, ${g}, ${b})`;
            
            this.elements.colorPreview.style.backgroundColor = colorString;
            this.elements.colorValue.textContent = colorString;

            this.frameCount++;
            if (this.frameCount % 60 === 0) {
                this.elements.frameCounter.textContent = `${this.frameCount} frames`;
            }

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    copyColorValue() {
        const colorText = this.elements.colorValue.textContent;
        navigator.clipboard.writeText(colorText).then(() => {
            const originalText = this.elements.copyButton.innerHTML;
            this.elements.copyButton.innerHTML = '<span style="color: #10b981;">✓</span>';
            setTimeout(() => {
                this.elements.copyButton.innerHTML = originalText;
            }, 1500);
        });
    }
}

// ===== INITIALIZE APPLICATION =====

document.addEventListener('DOMContentLoaded', () => {
    new ColorLab();
});