import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ModelLoader } from './utils/modelLoader';

// Shaders
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';

class App {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private gui: GUI;
    
    // Privados para el post-procesado
    private composer: EffectComposer;
    private lavaLampModel: THREE.Object3D | null = null; 
    private bloomPass: ShaderPass;

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
            model.scale.set(1/6, 1/6, 1/6);
            model.position.set(0, -8, -8);
            this.scene.add(model);
            this.lavaLampModel = model;
        });
        
        // Configuración de las luces
        const pointLight = new THREE.PointLight(0xffffff, 100);
        pointLight.position.set(5, 10, 10);
        this.scene.add(pointLight);

        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // Post-procesamiento
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom Shader Pass
        const bloomShader = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null }, // Textura renderizada
                intensity: { value: 1.0}, // Intensidad
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, // Resolución de la pantalla
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            glslVersion: THREE.GLSL3,
        });

        this.bloomPass = new ShaderPass(bloomShader); // Inicializamos bloomPass
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.set(
            1 / window.innerWidth,
            1 / window.innerHeight
        );

        // Composer y Passes
        this.composer.addPass(this.bloomPass);
        this.composer.addPass(fxaaPass);

        // GUI
        this.gui = new GUI();
        this.setupGUI();

        this.onWindowResize();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.animate();
    }

    private moveLava(): void {
        if (this.lavaLampModel) {
            const lavaBlobs = this.lavaLampModel.getObjectByName('bloblp');
            if (lavaBlobs) {
                const time = Date.now() * 0.002;
                const amplitude = 0.2;
                const offset = 50;
                lavaBlobs.position.y = Math.sin(time) * amplitude + offset;
                lavaBlobs.position.x = Math.sin(time) * amplitude + 4.7;
            }
        }
    } 

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        this.moveLava(); // Mover la lava
        this.renderer.render(this.scene, this.camera);
    }

    private setupGUI(): void {
        const bloomFolder = this.gui.addFolder('Bloom Settings');
        bloomFolder.add(this.bloomPass.material.uniforms['intensity'], 'value', 0, 5, 0.1).name('Bloom Intensity');
        bloomFolder.open();
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const myApp = new App();