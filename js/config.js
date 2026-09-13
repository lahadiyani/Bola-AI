// config.js
export const CONFIG = {
    camera: {
        fov: 45,
        near: 0.1,
        far: 100,
        position: { x: 0, y: 0, z: 18 }
    },
    lights: {
        directional: { color: 0xffffff, intensity: 1.2, pos: { x: 10, y: 20, z: 10 } },
        ambient: { color: 0xffffff, intensity: 0.6 }
    },
    shapesCount: 60,
    typewriterSpeed: 30,
    selectors: {
        canvas: '#world-canvas',
        uiLayer: 'ui-layer',
        carouselPrev: 'prev-persona',
        carouselNext: 'next-persona',
        personaName: 'p-name',
        personaDesc: 'p-desc',
        speechBubble: 'speech-bubble',
        domAvatar: 'dom-avatar-el',
        bubbleTitle: 'bubble-title',
        bubbleText: 'bubble-text',
        bubbleFooter: 'bubble-footer'
    }
};