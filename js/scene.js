import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './config.js';

export class WorldScene {
    constructor(canvasSelector) {
        this.canvas = document.querySelector(canvasSelector);
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();
        this.isTyping = false;

        // Inisialisasi GLTFLoader untuk memuat skin 3D (.glb)
        this.gltfLoader = new GLTFLoader();

        this.initScene();
        this.initLights();
        this.initHero();
        this.initAmbientShapes();
        this.addEventListeners();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.fog = new THREE.Fog(0xFFF9F0, 10, 40);
        this.scene.fog = this.fog;

        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    }

    initLights() {
        const dir = CONFIG.lights.directional;
        const dirLight = new THREE.DirectionalLight(dir.color, dir.intensity);
        dirLight.position.set(dir.pos.x, dir.pos.y, dir.pos.z);
        
        const amb = CONFIG.lights.ambient;
        const ambLight = new THREE.AmbientLight(amb.color, amb.intensity);
        
        this.scene.add(dirLight, ambLight);
    }

    initHero() {
        this.heroGroup = new THREE.Group();
        this.scene.add(this.heroGroup);

        // Body Utama Bola Default
        this.heroMat = new THREE.MeshStandardMaterial({ color: 0xFF8E8E, roughness: 0.3 });
        this.hero = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), this.heroMat);
        this.heroGroup.add(this.hero);

        // Group untuk ekspresi wajah
        this.faceGroup = new THREE.Group();
        this.heroGroup.add(this.faceGroup);

        // Group khusus aksesoris bawaan persona
        this.accessoryGroup = new THREE.Group();
        this.heroGroup.add(this.accessoryGroup);

        // Group khusus untuk pakaian / outfit dari skin.json (.glb)
        this.skinGroup = new THREE.Group();
        this.heroGroup.add(this.skinGroup);
    }

    initAmbientShapes() {
        this.shapesGroup = new THREE.Group();
        this.scene.add(this.shapesGroup);

        const colors = [0xFFC3C3, 0xB4D8E7, 0xD4C1EC, 0xFFF5BA];
        const geometries = [
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.IcosahedronGeometry(0.7)
        ];

        for (let i = 0; i < CONFIG.shapesCount; i++) {
            const geom = geometries[i % geometries.length];
            const mat = new THREE.MeshStandardMaterial({
                color: colors[i % colors.length],
                roughness: 0.5,
                flatShading: true
            });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                -Math.random() * 40 - 10
            );
            mesh.userData = { rotSpeed: (Math.random() - 0.5) * 0.01, initialY: mesh.position.y };
            this.shapesGroup.add(mesh);
        }
    }

    // Clear memory objek 3D
    clearGroup(group) {
        while (group.children.length > 0) {
            const obj = group.children[0];
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
            group.remove(obj);
        }
    }

    // Method untuk mengaplikasikan skin/pakaian dari skin.json
    applySkinConfig(skinConfig) {
        // Bersihkan model skin/pakaian yang sedang terpasang
        this.clearGroup(this.skinGroup);

        if (!skinConfig || !skinConfig.attachments) return;

        skinConfig.attachments.forEach(item => {
            if (!item.modelPath) return;

            this.gltfLoader.load(
                item.modelPath,
                (gltf) => {
                    const model = gltf.scene;

                    if (item.position) model.position.set(...item.position);
                    if (item.rotation) model.rotation.set(...item.rotation);
                    if (item.scale) model.scale.set(...item.scale);

                    this.skinGroup.add(model);
                },
                undefined,
                (error) => {
                    console.error(`Gagal memuat model GLB: ${item.modelPath}`, error);
                }
            );
        });
    }

    buildFace(personaId) {
        this.clearGroup(this.faceGroup);

        if (personaId === 'persona_cyber') {
            const visorGeom = new THREE.BoxGeometry(2.4, 0.4, 0.2);
            const visorMat = new THREE.MeshBasicMaterial({ color: 0x00FFCC });
            const visor = new THREE.Mesh(visorGeom, visorMat);
            visor.position.set(0, 0.3, 2.38);
            this.faceGroup.add(visor);

        } else if (personaId === 'persona_cute') {
            const eyeGeom = new THREE.CircleGeometry(0.35, 32);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });

            const glintGeom = new THREE.CircleGeometry(0.12, 16);
            const glintMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

            const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
            leftEye.position.set(-0.7, 0.4, 2.42);
            const leftGlint = new THREE.Mesh(glintGeom, glintMat);
            leftGlint.position.set(-0.6, 0.5, 2.43);

            const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
            rightEye.position.set(0.7, 0.4, 2.42);
            const rightGlint = new THREE.Mesh(glintGeom, glintMat);
            rightGlint.position.set(0.8, 0.5, 2.43);

            const blushGeom = new THREE.CircleGeometry(0.25, 16);
            const blushMat = new THREE.MeshBasicMaterial({ color: 0xFF88A7, transparent: true, opacity: 0.6 });
            const leftBlush = new THREE.Mesh(blushGeom, blushMat);
            leftBlush.position.set(-0.9, 0.0, 2.38);
            const rightBlush = new THREE.Mesh(blushGeom, blushMat);
            rightBlush.position.set(0.9, 0.0, 2.38);

            this.faceGroup.add(leftEye, leftGlint, rightEye, rightGlint, leftBlush, rightBlush);

        } else {
            const eyeGeom = new THREE.SphereGeometry(0.35, 16, 16);
            eyeGeom.scale(1, 1.2, 0.4);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });

            const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
            leftEye.position.set(-0.65, 0.3, 2.35);

            const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
            rightEye.position.set(0.65, 0.3, 2.35);

            this.faceGroup.add(leftEye, rightEye);
        }
    }

    buildAccessory(personaId) {
        this.clearGroup(this.accessoryGroup);

        if (personaId === 'persona_cyber') {
            const ringGeom = new THREE.TorusGeometry(3.1, 0.05, 16, 64);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x00FFCC, wireframe: true });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2.5;
            ring.name = 'orbitRing';
            this.accessoryGroup.add(ring);

        } else if (personaId === 'persona_cute') {
            const earGeom = new THREE.ConeGeometry(0.5, 0.8, 16);
            const earMat = new THREE.MeshStandardMaterial({ color: 0xFFB7B2, roughness: 0.4 });

            const leftEar = new THREE.Mesh(earGeom, earMat);
            leftEar.position.set(-1.1, 2.2, 0);
            leftEar.rotation.z = 0.25;

            const rightEar = new THREE.Mesh(earGeom, earMat);
            rightEar.position.set(1.1, 2.2, 0);
            rightEar.rotation.z = -0.25;

            this.accessoryGroup.add(leftEar, rightEar);
        }
    }

    applyPersonaConfig(cfg) {
        this.heroMat.color.set(cfg.color);
        this.heroMat.wireframe = (cfg.materialType === 'wireframe_glow');

        const personaId = cfg.id || 'persona_default';
        this.buildFace(personaId);
        this.buildAccessory(personaId);

        this.fog.color.set(cfg.fogColor);
        this.canvas.style.background = cfg.fogColor;
    }

    setHeroVisibility(visible) {
        this.heroGroup.visible = visible;
    }

    setTypingState(isTyping) {
        this.isTyping = isTyping;
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        const elapsedTime = this.clock.getElapsedTime();

        this.shapesGroup.children.forEach(mesh => {
            mesh.rotation.x += mesh.userData.rotSpeed;
            mesh.rotation.y += mesh.userData.rotSpeed;
            mesh.position.y = mesh.userData.initialY + Math.sin(elapsedTime + mesh.position.x) * 0.5;
        });

        const ring = this.accessoryGroup.getObjectByName('orbitRing');
        if (ring) {
            ring.rotation.z += 0.015;
        }

        if (!this.isTyping && this.heroGroup.visible) {
            this.heroGroup.rotation.y += (this.mouse.x * 0.25 - this.heroGroup.rotation.y) * 0.1;
            this.heroGroup.rotation.x += (-this.mouse.y * 0.25 - this.heroGroup.rotation.x) * 0.1;

            const breath = 1 + Math.sin(elapsedTime * 2.5) * 0.015;
            this.heroGroup.scale.set(breath, breath, breath);
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }
}