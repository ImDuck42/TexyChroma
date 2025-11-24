class LexiChroma {
    #STORAGE_KEY = 'lexichroma_ultimate_v4';
    #rafId = null;
    #pendingRender = false;
    #pendingHighlight = false;

    constructor() {
        this.dom = this.#initializeDOM();
        this.state = this.#initializeState();
        
        this.init();
    }

    #initializeDOM() {
        const dom = {};
        
        // Text editor elements
        dom.textInput = document.getElementById('textInput');
        dom.editorHighlights = document.getElementById('editorHighlights');
        dom.editorBackdrop = document.querySelector('.editor-backdrop');
        
        // Canvas elements
        dom.canvas = document.getElementById('pixelCanvas');
        dom.ctx = dom.canvas.getContext('2d', { alpha: true });
        dom.viewport = document.getElementById('viewport');
        dom.transformLayer = document.getElementById('transformLayer');
        
        // Modal elements
        dom.rendererModal = document.getElementById('rendererModal');
        dom.algoModal = document.getElementById('algoModal');
        dom.detailModal = document.getElementById('detailModal');
        
        // Input elements
        dom.imageUpload = document.getElementById('imageUpload');
        dom.projectName = document.getElementById('projectName');
        dom.width = document.getElementById('gridWidth');
        dom.height = document.getElementById('gridHeight');
        dom.autoHeight = document.getElementById('autoHeight');
        dom.trimWidth = document.getElementById('trimWidth');
        dom.emptyFill = document.getElementById('emptyFill');
        dom.customFillColor = document.getElementById('customFillColor');
        dom.seed = document.getElementById('colorSeed');
        dom.exportScale = document.getElementById('exportScale');
        dom.syntaxHighlight = document.getElementById('syntaxHighlight');
        
        // Algorithm inputs
        dom.algoHueMult = document.getElementById('algoHueMult');
        dom.algoHueOffset = document.getElementById('algoHueOffset');
        dom.algoFirstCharBias = document.getElementById('algoFirstCharBias');
        dom.algoSineInf = document.getElementById('algoSineInf');
        dom.algoSatBase = document.getElementById('algoSatBase');
        dom.algoLigBase = document.getElementById('algoLigBase');
        dom.algoLenInf = document.getElementById('algoLenInf');
        dom.algoBitShift = document.getElementById('algoBitShift');
        dom.algoPrimeMod = document.getElementById('algoPrimeMod');
        dom.algoXor = document.getElementById('algoXor');

        // Detail panel
        dom.detailSwatch = document.getElementById('detailColorPreview');
        dom.detailXY = document.getElementById('detailXY');
        dom.detailWord = document.getElementById('detailWord');
        dom.detailHash = document.getElementById('detailHash');
        dom.detailHex = document.getElementById('detailHex');
        dom.detailRGB = document.getElementById('detailRGB');
        dom.detailHSL = document.getElementById('detailHSL');
        
        // Labels
        dom.valSeed = document.getElementById('val-seed');
        dom.wordCounter = document.getElementById('wordCounter');
        dom.resCounter = document.getElementById('resCounter');
        dom.zoomLevel = document.getElementById('zoomLevel');

        return dom;
    }

    #initializeState() {
        return {
            text: "",
            words: [],
            gridW: 32,
            gridH: 32,
            isAutoHeight: true,
            isTrimWidth: false,
            emptyFill: 'black',
            customFill: '#1a1c24',
            seed: 145,
            colorizeText: true,
            projectName: "untitled_project",
            
            algo: {
                hueMult: 1.0,
                hueOffset: 0,
                firstCharBias: 0,
                sineInf: 0,
                satBase: 60,
                ligBase: 40,
                lenInf: 0,
                bitShift: 5,
                primeMod: 0,
                xorVal: 0
            },

            // Viewport state
            camX: 0,
            camY: 0,
            scale: 1,
            isDragging: false,
            lastMouseX: 0,
            lastMouseY: 0,
            dragDistance: 0
        };
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.#bindTextEvents();
        this.#bindInputEvents();
        this.#bindAlgorithmEvents();
        this.#bindButtonEvents();
        this.#bindViewportEvents();
        this.#bindKeyboardEvents();
    }

    #bindTextEvents() {
        this.dom.textInput.addEventListener('input', (e) => {
            this.state.text = e.target.value;
            this.scheduleRender();
            this.saveToStorage();
            if (this.state.colorizeText) this.scheduleHighlight();
        });

        this.dom.syntaxHighlight.addEventListener('change', (e) => {
            this.state.colorizeText = e.target.checked;
            if (!this.state.colorizeText) {
                this.dom.editorHighlights.innerHTML = '';
                this.dom.textInput.classList.add('show-text');
            } else {
                this.dom.textInput.classList.remove('show-text');
                this.updateHighlights();
            }
            this.saveToStorage();
        });

        // Set initial state for textarea color
        if (!this.state.colorizeText) {
            this.dom.textInput.classList.add('show-text');
        } else {
            this.dom.textInput.classList.remove('show-text');
        }
    }

    #bindInputEvents() {
        // Basic inputs
        this.#bindInput(this.dom.width, 'gridW', true);
        this.#bindInput(this.dom.seed, 'seed', true, this.dom.valSeed);
        
        this.dom.projectName.addEventListener('input', (e) => {
            this.state.projectName = e.target.value.replace(/[^a-z0-9_-]/gi, '_');
            this.saveToStorage();
        });

        // Logic controls
        this.dom.autoHeight.addEventListener('change', (e) => {
            this.state.isAutoHeight = e.target.checked;
            this.dom.height.disabled = this.state.isAutoHeight;
            this.scheduleRender();
            this.saveToStorage();
        });
        
        this.dom.trimWidth.addEventListener('change', (e) => {
            this.state.isTrimWidth = e.target.checked;
            this.scheduleRender();
            this.saveToStorage();
        });

        this.dom.emptyFill.addEventListener('change', (e) => {
            this.state.emptyFill = e.target.value;
            this.toggleCustomColor();
            this.scheduleRender();
            this.saveToStorage();
        });

        this.dom.customFillColor.addEventListener('input', (e) => {
            this.state.customFill = e.target.value;
            if (this.state.emptyFill === 'custom') this.scheduleRender();
            this.saveToStorage();
        });
    }

    #bindAlgorithmEvents() {
        const algoBindings = [
            { elem: this.dom.algoHueMult, key: 'hueMult', isFloat: true },
            { elem: this.dom.algoHueOffset, key: 'hueOffset' },
            { elem: this.dom.algoFirstCharBias, key: 'firstCharBias' },
            { elem: this.dom.algoSineInf, key: 'sineInf' },
            { elem: this.dom.algoSatBase, key: 'satBase' },
            { elem: this.dom.algoLigBase, key: 'ligBase' },
            { elem: this.dom.algoLenInf, key: 'lenInf' },
            { elem: this.dom.algoBitShift, key: 'bitShift' },
            { elem: this.dom.algoPrimeMod, key: 'primeMod' },
            { elem: this.dom.algoXor, key: 'xorVal' }
        ];

        algoBindings.forEach(({ elem, key, isFloat = false }) => {
            elem.addEventListener('input', (e) => {
                let val = parseFloat(e.target.value);
                if (!isFloat) val = parseInt(val);
                this.state.algo[key] = val;
                this.scheduleRender();
                this.saveToStorage();
                if (this.state.colorizeText) this.scheduleHighlight();
            });
        });
    }

    #bindButtonEvents() {
        // Modal controls
        document.getElementById('openRendererBtn').addEventListener('click', () => this.openRenderer());
        document.getElementById('closeRendererBtn').addEventListener('click', () => this.closeRenderer());
        document.getElementById('openAlgoSettings').addEventListener('click', () => this.openModal(this.dom.algoModal));
        document.getElementById('closeAlgoBtn').addEventListener('click', () => this.closeModal(this.dom.algoModal));
        document.getElementById('closeDetailBtn').addEventListener('click', () => this.closeModal(this.dom.detailModal));
        
        // Action buttons
        document.getElementById('clearTextBtn').addEventListener('click', () => this.clearText());
        document.getElementById('fitScreenBtn').addEventListener('click', () => this.fitToScreen());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadWithMetadata());
        document.getElementById('resetAlgoBtn').addEventListener('click', () => this.resetAlgo());

        // Image upload
        this.dom.imageUpload.addEventListener('change', (e) => this.handleImageRestore(e));
    }

    #bindViewportEvents() {
        const vp = this.dom.viewport;
        vp.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        vp.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    #bindKeyboardEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeRenderer();
                this.closeModal(this.dom.algoModal);
                this.closeModal(this.dom.detailModal);
            }
        });
    }

    #bindInput(elem, stateKey, isInt = false, labelElem = null) {
        elem.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (isInt) val = parseInt(e.target.value) || 1;
            this.state[stateKey] = val;
            if (labelElem) labelElem.textContent = val;
            this.scheduleRender();
            this.saveToStorage();
        });
    }

    // --- Performance Optimization ---
    scheduleRender() {
        if (this.#pendingRender) return;
        this.#pendingRender = true;
        this.#rafId = requestAnimationFrame(() => {
            this.render();
            this.#pendingRender = false;
        });
    }

    scheduleHighlight() {
        if (this.#pendingHighlight) return;
        this.#pendingHighlight = true;
        requestAnimationFrame(() => {
            this.updateHighlights();
            this.#pendingHighlight = false;
        });
    }

    // --- Core Rendering ---
    render() {
        this.state.words = this.state.text.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = this.state.words.length;
        
        const { renderWidth, renderHeight } = this.#calculateDimensions(wordCount);
        
        this.#setupCanvas(renderWidth, renderHeight);
        this.#renderBackground(renderWidth, renderHeight);
        this.#renderWords(renderWidth, renderHeight);

        this.#updateCounters(wordCount, renderWidth, renderHeight);
    }

    #calculateDimensions(wordCount) {
        let renderWidth = this.state.gridW;
        
        // Width logic
        if (this.state.isTrimWidth) {
            renderWidth = Math.max(1, wordCount > 0 ? Math.min(wordCount, this.state.gridW) : 1);
        }

        // Height logic
        let renderHeight = this.state.gridH;
        if (this.state.isAutoHeight) {
            renderHeight = Math.max(1, Math.ceil(wordCount / this.state.gridW));
            this.dom.height.value = renderHeight;
            this.state.gridH = renderHeight;
        }

        return { renderWidth, renderHeight };
    }

    #setupCanvas(width, height) {
        this.dom.canvas.width = width;
        this.dom.canvas.height = height;
    }

    #renderBackground(width, height) {
        this.dom.ctx.clearRect(0, 0, width, height);
        
        const fillStyles = {
            transparent: 'transparent',
            custom: this.state.customFill
        };

        const fillColor = fillStyles[this.state.emptyFill];
        if (fillColor && fillColor !== 'transparent') {
            this.dom.ctx.fillStyle = fillColor;
            this.dom.ctx.fillRect(0, 0, width, height);
        }
    }

    #renderWords(width, height) {
        this.state.words.forEach((word, index) => {
            const x = index % this.state.gridW;
            const y = Math.floor(index / this.state.gridW);
            
            if (x < width && y < height) {
                const data = this.getPixelData(word, index);
                this.dom.ctx.fillStyle = data.hslString;
                this.dom.ctx.fillRect(x, y, 1, 1);
            }
        });
    }

    #updateCounters(wordCount, width, height) {
        this.dom.wordCounter.textContent = wordCount;
        this.dom.resCounter.textContent = `${width} x ${height}`;
    }

    // --- Text Highlighting ---
    updateHighlights() {
        if (!this.state.colorizeText) return;
        
        const text = this.state.text;
        const tokens = text.split(/(\s+)/);
        let html = '';
        let wordIndex = 0;

        tokens.forEach(token => {
            if (token.trim().length === 0) {
                html += this.#escapeHtml(token);
            } else {
                const color = this.getPixelData(token, wordIndex).hslString;
                html += `<span style="color: ${color}; text-shadow: 0 0 1px rgba(0,0,0,0.8);">${this.#escapeHtml(token)}</span>`;
                wordIndex++;
            }
        });
        
        if (text.endsWith('\n')) html += '<br>';
        
        this.dom.editorHighlights.innerHTML = html;
    }

    #escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Color Algorithm ---
    getPixelData(word, index) {
        if (!word) return { hslString: 'transparent' };
        
        const { seed, algo } = this.state;
        let hash = this.#computeHash(word, seed, algo);
        
        const { h, s, l } = this.#computeHSL(hash, word, algo);
        
        return {
            h: h.toFixed(1),
            s: s.toFixed(1), 
            l: l.toFixed(1),
            hslString: `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`,
            hash: hash,
            word: word
        };
    }

    #computeHash(word, seed, algo) {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << algo.bitShift) - hash) + word.charCodeAt(i) + seed;
            hash |= 0;
        }
        
        if (algo.xorVal > 0) hash ^= algo.xorVal;
        if (algo.primeMod > 1) hash = hash % algo.primeMod;
        
        return hash;
    }

    #computeHSL(hash, word, algo) {
        const absHash = Math.abs(hash);
        
        // Hue calculation
        let hue = (absHash * algo.hueMult + algo.hueOffset);
        if (algo.firstCharBias > 0) hue += (word.charCodeAt(0) * algo.firstCharBias);
        if (algo.sineInf > 0) hue += Math.sin(absHash) * algo.sineInf;
        hue = hue % 360;

        // Saturation calculation
        let sat = algo.satBase;
        if (algo.lenInf !== 0) sat += (word.length * algo.lenInf);
        sat += ((absHash >> 8) % 20) - 10;
        sat = Math.max(0, Math.min(100, sat));

        // Lightness calculation
        let lig = algo.ligBase;
        lig += ((absHash >> 16) % 20) - 10;
        lig = Math.max(0, Math.min(100, lig));

        return { h: hue, s: sat, l: lig };
    }

    // --- UI Controls ---
    toggleCustomColor() {
        this.dom.customFillColor.classList.toggle('hidden', this.state.emptyFill !== 'custom');
    }

    // --- Viewport Controls ---
    handleMouseDown(e) {
        if (e.button === 0) {
            this.state.isDragging = true;
            this.state.lastMouseX = e.clientX;
            this.state.lastMouseY = e.clientY;
            this.state.dragDistance = 0;
            this.dom.viewport.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(e) {
        if (this.state.isDragging) {
            const dx = e.clientX - this.state.lastMouseX;
            const dy = e.clientY - this.state.lastMouseY;
            this.state.camX += dx;
            this.state.camY += dy;
            this.state.lastMouseX = e.clientX;
            this.state.lastMouseY = e.clientY;
            this.state.dragDistance += Math.abs(dx) + Math.abs(dy);
            this.updateTransform();
        }
    }

    handleMouseUp(e) {
        this.state.isDragging = false;
        this.dom.viewport.style.cursor = 'default';
        
        if (this.state.dragDistance < 5 && e.target === this.dom.canvas) {
            this.handlePixelClick(e);
        }
    }

    handleWheel(e) {
        if (this.dom.rendererModal.classList.contains('hidden')) return;
        
        e.preventDefault();
        const rect = this.dom.viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const oldScale = this.state.scale;
        let newScale = oldScale * (e.deltaY < 0 ? 1.15 : 0.85);
        newScale = Math.min(Math.max(0.1, newScale), 500);
        
        const scaleRatio = newScale / oldScale;
        this.state.camX = mouseX - (mouseX - this.state.camX) * scaleRatio;
        this.state.camY = mouseY - (mouseY - this.state.camY) * scaleRatio;
        this.state.scale = newScale;
        
        this.updateTransform();
    }

    handlePixelClick(e) {
        const rect = this.dom.viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const cx = Math.floor((mouseX - this.state.camX) / this.state.scale);
        const cy = Math.floor((mouseY - this.state.camY) / this.state.scale);
        
        if (cx >= 0 && cx < this.dom.canvas.width && cy >= 0 && cy < this.dom.canvas.height) {
            const index = cy * this.state.gridW + cx;
            
            if (index < this.state.words.length) {
                const word = this.state.words[index];
                if (word) {
                    const data = this.getPixelData(word, index);
                    this.openDetailModal(data, cx, cy);
                }
            }
        }
    }

    updateTransform() {
        this.dom.transformLayer.style.transform = 
            `translate3d(${this.state.camX}px, ${this.state.camY}px, 0) scale(${this.state.scale})`;
        this.dom.zoomLevel.textContent = `${Math.round(this.state.scale * 100)}%`;
    }

    fitToScreen() {
        const vpW = this.dom.viewport.clientWidth;
        const vpH = this.dom.viewport.clientHeight;
        const cnvW = this.dom.canvas.width;
        const cnvH = this.dom.canvas.height;
        const margin = 150;
        
        const scaleX = (vpW - margin) / cnvW;
        const scaleY = (vpH - margin) / cnvH;
        let fitScale = Math.min(scaleX, scaleY);
        fitScale = Math.min(Math.max(fitScale, 0.5), 100);
        
        this.state.scale = fitScale;
        this.state.camX = (vpW - (cnvW * fitScale)) / 2;
        this.state.camY = (vpH - (cnvH * fitScale)) / 2;
        
        this.updateTransform();
    }

    // --- Modal Controls ---
    openRenderer() {
        this.dom.rendererModal.classList.remove('hidden');
        requestAnimationFrame(() => this.fitToScreen());
    }

    closeRenderer() {
        this.dom.rendererModal.classList.add('hidden');
    }

    openModal(modal) {
        modal.classList.remove('hidden');
    }

    closeModal(modal) {
        modal.classList.add('hidden');
    }

    openDetailModal(data, x, y) {
        const { h, s, l, hslString, word, hash } = data;
        const rgb = this.hslToRgb(h, s, l);
        
        this.dom.detailSwatch.style.backgroundColor = hslString;
        this.dom.detailXY.textContent = `X:${x} Y:${y}`;
        this.dom.detailWord.textContent = word;
        this.dom.detailHash.textContent = hash;
        this.dom.detailHSL.textContent = `${Math.round(h)}°, ${Math.round(s)}%, ${Math.round(l)}%`;
        this.dom.detailRGB.textContent = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
        this.dom.detailHex.textContent = "#" + rgb.map(x => 
            x.toString(16).padStart(2, '0')
        ).join("").toUpperCase();
        
        this.openModal(this.dom.detailModal);
    }

    // --- Actions ---
    clearText() {
        if (confirm("Clear text?")) {
            this.dom.textInput.value = "";
            this.state.text = "";
            this.scheduleRender();
            this.updateHighlights();
            this.saveToStorage();
        }
    }

    resetAlgo() {
        this.state.algo = {
            hueMult: 1.0,
            hueOffset: 0,
            firstCharBias: 0,
            sineInf: 0,
            satBase: 60,
            ligBase: 40,
            lenInf: 0,
            bitShift: 5,
            primeMod: 0,
            xorVal: 0
        };
        
        this.updateAllInputs();
        this.scheduleRender();
        if (this.state.colorizeText) this.scheduleHighlight();
        this.saveToStorage();
    }

    // --- PNG Export & Import ---
    async downloadWithMetadata() {
        if (!this.state.words.length) return;
        
        const scale = parseInt(this.dom.exportScale.value) || 20;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.dom.canvas.width * scale;
        tempCanvas.height = this.dom.canvas.height * scale;
        
        const tCtx = tempCanvas.getContext('2d');
        tCtx.imageSmoothingEnabled = false;
        tCtx.drawImage(this.dom.canvas, 0, 0, tempCanvas.width, tempCanvas.height);

        tempCanvas.toBlob(async (blob) => {
            const metaData = JSON.stringify({
                text: this.state.text,
                settings: {
                    gridW: this.state.gridW,
                    seed: this.state.seed,
                    algo: this.state.algo,
                    emptyFill: this.state.emptyFill,
                    customFill: this.state.customFill,
                    trimWidth: this.state.isTrimWidth
                }
            });
            
            const newBlob = await this.injectPngMetadata(blob, "LexiChromaData", metaData);
            const link = document.createElement('a');
            link.download = `${this.state.projectName || 'lexichroma'}.png`;
            link.href = URL.createObjectURL(newBlob);
            link.click();
            URL.revokeObjectURL(link.href);
        }, 'image/png');
    }

    async injectPngMetadata(blob, key, value) {
        const buffer = await blob.arrayBuffer();
        const data = new Uint8Array(buffer);
        let i = 8;
        
        while (i < data.length) {
            const len = new DataView(data.buffer).getUint32(i);
            const type = new TextDecoder().decode(data.slice(i + 4, i + 8));
            if (type === 'IEND') break;
            i += 12 + len;
        }
        
        const keyBytes = new TextEncoder().encode(key);
        const valBytes = new TextEncoder().encode(value);
        const chunkData = new Uint8Array(keyBytes.length + 1 + valBytes.length);
        chunkData.set(keyBytes, 0);
        chunkData[keyBytes.length] = 0;
        chunkData.set(valBytes, keyBytes.length + 1);
        
        const chunkLen = chunkData.length;
        const totalChunkLen = 12 + chunkLen;
        const chunk = new Uint8Array(totalChunkLen);
        const view = new DataView(chunk.buffer);
        
        view.setUint32(0, chunkLen);
        chunk.set(new TextEncoder().encode("tEXt"), 4);
        chunk.set(chunkData, 8);
        
        const finalFile = new Uint8Array(i + totalChunkLen + 12);
        finalFile.set(data.slice(0, i), 0);
        finalFile.set(chunk, i);
        finalFile.set(data.slice(i), i + totalChunkLen);
        
        return new Blob([finalFile], { type: 'image/png' });
    }

    async handleImageRestore(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const buf = await file.arrayBuffer();
            const data = this.#extractPngMetadata(buf);
            
            if (data && confirm("Restore project?")) {
                this.restoreState(data);
            } else {
                alert("No LexiChroma data found.");
            }
        } catch (error) {
            console.error("Error restoring image:", error);
            alert("Error reading file.");
        }
    }

    #extractPngMetadata(buffer) {
        const view = new DataView(buffer);
        let i = 8;
        
        while (i < buffer.byteLength) {
            const len = view.getUint32(i);
            const typeArr = new Uint8Array(buffer, i + 4, 4);
            const type = new TextDecoder().decode(typeArr);
            
            if (type === 'tEXt') {
                const data = new Uint8Array(buffer, i + 8, len);
                const key = "LexiChromaData";
                const keyBytes = new TextEncoder().encode(key);
                
                let match = true;
                for (let k = 0; k < keyBytes.length; k++) {
                    if (data[k] !== keyBytes[k]) {
                        match = false;
                        break;
                    }
                }
                
                if (match) {
                    const jsonStr = new TextDecoder().decode(data.slice(key.length + 1));
                    return JSON.parse(jsonStr);
                }
            }
            i += 12 + len;
        }
        return null;
    }

    // --- State Management ---
    restoreState(data) {
        this.state.text = data.text;
        this.state.gridW = data.settings.gridW;
        this.state.seed = data.settings.seed;
        this.state.algo = data.settings.algo;
        this.state.emptyFill = data.settings.emptyFill || 'black';
        this.state.customFill = data.settings.customFill || '#1a1c24';
        this.state.isTrimWidth = data.settings.trimWidth || false;
        
        this.updateAllInputs();
        this.toggleCustomColor();
        this.scheduleRender();
        if (this.state.colorizeText) this.scheduleHighlight();
        this.saveToStorage();
    }

    saveToStorage() {
        const data = {
            text: this.state.text,
            gridW: this.state.gridW,
            gridH: this.state.gridH,
            isAutoHeight: this.state.isAutoHeight,
            isTrimWidth: this.state.isTrimWidth,
            emptyFill: this.state.emptyFill,
            customFill: this.state.customFill,
            seed: this.state.seed,
            algo: this.state.algo,
            projectName: this.state.projectName,
            colorizeText: this.state.colorizeText
        };
        
        localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(data));
    }

    loadFromStorage() {
        const raw = localStorage.getItem(this.#STORAGE_KEY);
        if (!raw) return;
        
        try {
            const data = JSON.parse(raw);
            this.state = { ...this.state, ...data };
            this.updateAllInputs();
            this.toggleCustomColor();
            
            if (this.state.colorizeText) {
                setTimeout(() => this.updateHighlights(), 100);
            }
        } catch (e) {
            console.error("Load failed", e);
        }
    }

    updateAllInputs() {
        // Basic inputs
        this.dom.textInput.value = this.state.text;
        this.dom.width.value = this.state.gridW;
        this.dom.height.value = this.state.gridH;
        this.dom.autoHeight.checked = this.state.isAutoHeight;
        this.dom.trimWidth.checked = this.state.isTrimWidth;
        this.dom.emptyFill.value = this.state.emptyFill;
        this.dom.customFillColor.value = this.state.customFill;
        this.dom.seed.value = this.state.seed;
        this.dom.valSeed.textContent = this.state.seed;
        this.dom.projectName.value = this.state.projectName;
        this.dom.syntaxHighlight.checked = this.state.colorizeText;
        // Show/hide text color based on colorizeText
        if (!this.state.colorizeText) {
            this.dom.textInput.classList.add('show-text');
        } else {
            this.dom.textInput.classList.remove('show-text');
        }
    }

    // --- Utility Methods ---
    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [
            Math.round(f(0) * 255),
            Math.round(f(8) * 255),
            Math.round(f(4) * 255)
        ];
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LexiChroma();
});
