import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { ModelLoader } from './utils/modelLoader';

// Shaders
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';

class App {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private composer: EffectComposer;
    
    private gui: GUI;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        // Configuración del renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            powerPreference: 'high-performance' 
        });
        if (!this.renderer.capabilities.isWebGL2) {
            console.warn('WebGL 2.0 no está disponible en este navegador.');
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Controles de la camara
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;

        // Cargar el modelo 
        ModelLoader.loadModel('../static/img/lava_lamp/scene.gltf', (model) => {
            //model.scale.set(0, 0, 7);
            model.position.set(0, 0, 0);
            this.scene.add(model);
        });
        
        const pointLight = new THREE.PointLight(0xffffff, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        this.onWindowResize();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.animate();
    }

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        //this.composer.render();
    
        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const myApp = new App();