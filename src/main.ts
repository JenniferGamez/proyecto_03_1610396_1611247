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
    private nightVisionPass: ShaderPass;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(-1, 3, 2);

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
        
        ModelLoader.loadModel('../static/img/strange_flower/scene.gltf', (model) => {
            model.scale.set(0.5, 0.5, 0.5);
            model.position.set(0, 0, 0);
            this.scene.add(model);
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

        // Shader para efecto de visión nocturna
        const nightVisionShader = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                noiseIntensity: { value: 0.1 }, // Valor inicial de la intensidad del ruido
                contrast: { value: 2.0 }, // Valor inicial del contraste
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            glslVersion: THREE.GLSL3,
        });

        this.nightVisionPass = new ShaderPass(nightVisionShader);

        // Shader de anti-aliasing FXAA
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.set(
            1 / window.innerWidth,
            1 / window.innerHeight
        );

        // Agregar los pases al composer
        this.composer.addPass(this.nightVisionPass);
        this.composer.addPass(fxaaPass);

        // GUI
        this.gui = new GUI();
        this.setupGUI();

        this.onWindowResize();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.animate();
    }

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
        // Renderizar con post-procesado
        //this.composer.render();
        
    }

    private setupGUI(): void {
        if (!this.nightVisionPass || !this.nightVisionPass.material.uniforms) {
            console.error('Error: nightVisionPass no está definido.');
            return;
        }

        const nightVisionFolder = this.gui.addFolder('Night Vision');
        nightVisionFolder.add(this.nightVisionPass.material.uniforms.noiseIntensity, 'value', 0, 1, 0.01).name('Noise Intensity');
        nightVisionFolder.add(this.nightVisionPass.material.uniforms.contrast, 'value', 0, 5, 0.1).name('Contrast');
        nightVisionFolder.open();
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Ajustar tamaño del composer
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
}

const myApp = new App();