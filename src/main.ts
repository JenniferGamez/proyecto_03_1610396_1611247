import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ModelLoader } from './utils/modelLoader';

import { ControlGui } from './ControlGui';
import { ParticleSystem } from './ParticleSystem';

// Shaders
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';

class App {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private composer: EffectComposer;
    private controls: OrbitControls;
    private bloomPass: ShaderPass;
    private gui: ControlGui;
    private particleSystem: ParticleSystem;
  
    private cameraConfig = {
      fov: 75,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 1000,
    }

    constructor() {
        // Crear la escena
        this.scene = new THREE.Scene();

        // Inicializar el sistema de particulas
        this.particleSystem = new ParticleSystem(this.scene);

        // Configuración de la camara
        this.camera = new THREE.PerspectiveCamera(
        this.cameraConfig.fov,
        this.cameraConfig.aspect,
        this.cameraConfig.near,
        this.cameraConfig.far
        );
  
        this.camera.position.set(-1, 3, 2);
  
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.set(
            1 / window.innerWidth,
            1 / window.innerHeight
        );
      
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
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
  
        // Cargar la flor ( Modelo 3D )
        ModelLoader.loadModel('../static/img/strange_flower/scene.gltf', (model) => {
            model.scale.set(0.5, 0.5, 0.5);
            model.position.set(0, 0, 0);
            this.scene.add(model);

            // Crear el sistema de partículas alrededor del modelo
            this.particleSystem.createParticles(model);
        });
        
        // Configuración de la luz
        const pointLight = new THREE.PointLight(0xffffff, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
    
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
  
        // Crear el post-procesamiento
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // ShaderPass para el Bloom
        const bloomShader = new THREE.RawShaderMaterial({
            uniforms: {
                tDiffuse: { value: null }, // Textura renderizada
                intensity: { value: 1.0 }, // Intensidad
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, // Resolución de la pantalla
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            glslVersion: THREE.GLSL3,
        });

        this.bloomPass = new ShaderPass(bloomShader);
        
        // Configurar la resolución del shader
        this.composer.addPass(this.bloomPass); // Agrega el efecto Bloom
        this.composer.addPass(fxaaPass); // Mejora la resolución
      
        this.gui = new ControlGui(this.bloomPass);
  
        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Actualizar la resolución en el shader
        this.bloomPass.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }
  
    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.composer.render(); // Renderiza con EffectComposer
        this.particleSystem.animateParticles(); // Actualiza la animación de partículas
    }
  }
  

const myApp = new App();