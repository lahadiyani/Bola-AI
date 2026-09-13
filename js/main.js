import { CONFIG } from './config.js';
import { WorldScene } from './scene.js';

class App {
    constructor() {
        this.topics = {};
        this.personas = [];
        this.intros = {};
        this.skins = [];
        this.currentPersonaIdx = 0;
        this.currentTopic = null;
        this.typeInterval = null;

        this.world = new WorldScene(CONFIG.selectors.canvas);
        this.bindDOM();
        this.init();
    }

    bindDOM() {
        const s = CONFIG.selectors;
        this.uiLayer = document.getElementById(s.uiLayer);
        this.speechBubble = document.getElementById(s.speechBubble);
        this.domAvatar = document.getElementById(s.domAvatar);
        this.titleEl = document.getElementById(s.bubbleTitle);
        this.textEl = document.getElementById(s.bubbleText);
        this.footerEl = document.getElementById(s.bubbleFooter);
        this.pName = document.getElementById(s.personaName);
        this.pDesc = document.getElementById(s.personaDesc);
    }

    async init() {
        try {
            const [resTopics, resPersonas, resIntros, resSkins] = await Promise.all([
                fetch('data/topics.json'),
                fetch('data/persona.json'),
                fetch('data/intro.json'),
                fetch('data/skin.json')
            ]);

            this.topics = await resTopics.json();
            this.personas = await resPersonas.json();
            this.intros = await resIntros.json();
            this.skins = await resSkins.json();

            this.renderUILayer();

            // Terapkan persona awal (otomatis memuat skin default milik persona tersebut)
            this.applyPersona(this.personas[this.currentPersonaIdx]);

            this.attachEvents();
        } catch (err) {
            console.error("Gagal memuat file JSON:", err);
        }
    }

    renderUILayer() {
        this.uiLayer.innerHTML = '';
        const keys = Object.keys(this.topics);
        const total = keys.length;

        keys.forEach((key, index) => {
            const item = this.topics[key];
            const btn = document.createElement('button');
            btn.className = 'orbit-label';
            btn.dataset.topic = key;
            btn.innerHTML = `${item.label || key} ${item.icon || ''}`;

            if (item.pos) {
                Object.assign(btn.style, item.pos);
            } else {
                const angle = (index / total) * (2 * Math.PI) - (Math.PI / 2);
                const x = 50 + 35 * Math.cos(angle);
                const y = 50 + 30 * Math.sin(angle);
                btn.style.left = `${x}%`;
                btn.style.top = `${y}%`;
                btn.style.transform = 'translate(-50%, -50%)';
            }

            btn.style.animationDelay = `${(index * 0.5) % 3}s`;
            this.uiLayer.appendChild(btn);
        });
    }

    /**
     * Method khusus untuk mengubah/melepas skin/aksesoris secara dinamis
     * @param {string|null} skinId - ID skin dari skin.json, atau null/empty jika ingin melepas aksesoris
     */
    changeSkin(skinId) {
        if (!skinId || skinId === 'skin_none') {
            // Bersihkan semua aksesoris/pakaian GLB dari scene
            this.world.applySkinConfig(null);
            return;
        }

        // Cari konfigurasi skin berdasarkan ID di skin.json
        const selectedSkin = this.skins.find(s => s.id === skinId);

        if (selectedSkin) {
            this.world.applySkinConfig(selectedSkin);
        } else {
            console.warn(`Skin dengan ID '${skinId}' tidak ditemukan di skin.json`);
            this.world.applySkinConfig(null);
        }
    }

    applyPersona(persona) {
        if (!persona) return;

        this.pName.innerText = persona.name;
        this.pDesc.innerText = persona.description;

        // 1. Terapkan konfigurasi dasar persona (warna, bentuk mata dasar, lighting, dll)
        this.world.applyPersonaConfig(persona.config);
        this.domAvatar.style.background = persona.config.color;

        // 2. Baca default skinId dari persona.json, jika tidak ada fallback ke skin_default
        const personaDefaultSkinId = persona.config?.skinId || 'skin_default';
        this.changeSkin(personaDefaultSkinId);
    }

    getPersonaIntro(topicKey) {
        const activePersona = this.personas[this.currentPersonaIdx];
        if (!activePersona || !this.intros[activePersona.id]) {
            return "Halo! Silakan lihat detailnya.";
        }
        return this.intros[activePersona.id][topicKey] || "Silakan klik tombol di bawah untuk informasi lebih lanjut.";
    }

    typeWriter(text, callback) {
        this.textEl.innerHTML = '';
        this.textEl.classList.add('typing-cursor');
        let i = 0;
        clearInterval(this.typeInterval);
        this.world.setTypingState(true);

        this.typeInterval = setInterval(() => {
            if (i < text.length) {
                this.textEl.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(this.typeInterval);
                this.textEl.classList.remove('typing-cursor');
                this.world.setTypingState(false);
                if (callback) callback();
            }
        }, CONFIG.typewriterSpeed);
    }

    speak(topic) {
        if (!this.topics[topic]) return;
        this.currentTopic = topic;

        this.speechBubble.classList.add('show');
        this.world.setHeroVisibility(false);
        this.domAvatar.classList.add('active');

        this.titleEl.innerText = this.topics[topic].title || this.topics[topic].label || topic;
        this.footerEl.classList.remove('show');

        const dynamicIntro = this.getPersonaIntro(topic);
        this.typeWriter(dynamicIntro, () => {
            this.footerEl.innerHTML = `
                <span class="question-text">Mau lihat info lengkapnya?</span>
                <button class="btn-more" id="btn-action-trigger">Detail ➜</button>
            `;
            this.footerEl.classList.add('show');
        });
    }

    showDetail(topic) {
        if (!topic || !this.topics[topic]) return;
        this.footerEl.classList.remove('show');

        this.textEl.innerHTML = this.topics[topic].details || '<p>Tidak ada detail tambahan.</p>';
        this.footerEl.innerHTML = `<button class="btn-back" id="btn-back-trigger">Kembali ⬅</button>`;
        this.footerEl.classList.add('show');
    }

    resetToIntro(topic) {
        if (!topic || !this.topics[topic]) return;
        this.footerEl.classList.remove('show');

        const dynamicIntro = this.getPersonaIntro(topic);
        this.typeWriter(dynamicIntro, () => {
            this.footerEl.innerHTML = `
                <span class="question-text">Mau lihat info lengkapnya?</span>
                <button class="btn-more" id="btn-action-trigger">Detail ➜</button>
            `;
            this.footerEl.classList.add('show');
        });
    }

    hideBubble() {
        this.speechBubble.classList.remove('show');
        this.domAvatar.classList.remove('active');
        this.world.setHeroVisibility(true);
        clearInterval(this.typeInterval);
        this.world.setTypingState(false);
        this.currentTopic = null;
    }

    attachEvents() {
        document.getElementById(CONFIG.selectors.carouselPrev).addEventListener('click', () => {
            this.currentPersonaIdx = (this.currentPersonaIdx - 1 + this.personas.length) % this.personas.length;
            this.applyPersona(this.personas[this.currentPersonaIdx]);
        });

        document.getElementById(CONFIG.selectors.carouselNext).addEventListener('click', () => {
            this.currentPersonaIdx = (this.currentPersonaIdx + 1) % this.personas.length;
            this.applyPersona(this.personas[this.currentPersonaIdx]);
        });

        this.uiLayer.addEventListener('click', (e) => {
            const btn = e.target.closest('.orbit-label');
            if (btn) this.speak(btn.dataset.topic);
        });

        this.speechBubble.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.closest('#btn-action-trigger')) this.showDetail(this.currentTopic);
            if (e.target.closest('#btn-back-trigger')) this.resetToIntro(this.currentTopic);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.orbit-label') && !e.target.closest('#carousel-container')) {
                this.hideBubble();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideBubble();
        });
    }
}

// Simpan instance ke window agar bisa dites langsung via DevTools Console (contoh: window.app.changeSkin(null))
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});