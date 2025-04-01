import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';

// Shaders
import vertexGalaxy from './shaders/galaxy/vertex.glsl';
import fragmentGalaxy from './shaders/galaxy/fragment.glsl';
import vertexFireworks from './shaders/fireworks/vertex.glsl';
import fragmentFireworks from './shaders/fireworks/fragment.glsl';
import vertexWake from './shaders/wake/vertex.glsl';
import fragmentWake from './shaders/wake/fragment.glsl';

class App {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    
    private galaxyMaterial!: THREE.RawShaderMaterial;
    private fireworksMaterial!: THREE.RawShaderMaterial;
    private wakeMaterial!: THREE.RawShaderMaterial;
    private particlesGeometry!: THREE.BufferGeometry;
    private particlesMaterial!: THREE.ShaderMaterial;
    private particles!: THREE.Points;
    private trailObject!: THREE.Mesh;
    private trail!: THREE.Points;

    private startTime: number;
    private gui: GUI;

    private galaxyFolder!: GUI;
    private fireworksFolder!: GUI;
    private wakeFolder!: GUI;

    private settings = {
        particleSize: 1.0,
        timeMultiplier: 1.0,
        numPart: 10000,

        // Galaxy settings
        spiralFactor: 0.5,
        radiusScale: 1.0,
        shader: 'galaxy',

        // Fireworks settings
        gravityX: 0,
        gravityY: -0.8,
        gravityZ: 0,
        lifeTime: 2.0,
        explosionForce: 5.0,

        // Wake settings
        trailColor: new THREE.Color(1.0, 0.84, 0.0),
        baseSpeed: 1.00,
        opacity: 0.5,
    };

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        if (!this.renderer.capabilities.isWebGL2) {
        console.warn('WebGL 2.0 no está disponible en este navegador.');
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Sistema de particulas
        this.initMaterials();
        this.createParticles();
        
        // Controles de la camara
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        
        // GUI
        this.gui = new GUI();
        this.setupGUI();
        
        this.startTime = Date.now();
        this.onWindowResize();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.animate();
    }

    private initMaterials(): void {
        // Materiales para los distintos shaders
        // Galaxy
        this.galaxyMaterial = new THREE.RawShaderMaterial({
            vertexShader: vertexGalaxy,
            fragmentShader: fragmentGalaxy,
            uniforms: {
                u_time: { value: this.settings.timeMultiplier },
                u_spiralFactor: { value: this.settings.spiralFactor },
                u_radiusScale: { value: this.settings.radiusScale },
                u_particleSize: { value: this.settings.particleSize },
            },
            glslVersion: THREE.GLSL3,
        });

        // Fireworks
        this.fireworksMaterial = new THREE.RawShaderMaterial({
            vertexShader: vertexFireworks,
            fragmentShader: fragmentFireworks,
            uniforms: {
                u_time: { value: 0 },
                u_gravity: { value: new THREE.Vector3(this.settings.gravityX, this.settings.gravityY, this.settings.gravityZ) },
                u_particleSize: { value: this.settings.particleSize },
                u_lifeTime: { value: this.settings.lifeTime },

            },
            glslVersion: THREE.GLSL3,
        });

        // Wake
        this.wakeMaterial = new THREE.RawShaderMaterial({
            vertexShader: vertexWake,
            fragmentShader: fragmentWake,
            uniforms: {
                u_time: { value: this.settings.timeMultiplier },
                u_particleSize: { value: this.settings.particleSize },
                u_trailColor: { value: this.settings.trailColor },
                u_baseSpeed: { value: this.settings.baseSpeed },
                u_opacity: { value: this.settings.opacity },
            },
            transparent: true,
            depthWrite: false,
            glslVersion: THREE.GLSL3,   
        });
    }

    private createStarGeometry(): void {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.trailObject = new THREE.Mesh(geometry, material);
        this.scene.add(this.trailObject);
    }

    private createParticles(): void {
        if (this.particles) {
            this.scene.remove(this.particles);
            if(this.particlesGeometry) this.particlesGeometry.dispose();
            if(this.particlesMaterial) this.particlesMaterial.dispose();
            if (this.trail) this.scene.remove(this.trail);
            if (this.trailObject) this.scene.remove(this.trailObject);
        }

        if (this.trail) {
            this.scene.remove(this.trail);
            this.trail.geometry.dispose();
        }

        const positions = new Float32Array(this.settings.numPart * 3);
        const colors = new Float32Array(this.settings.numPart * 3);
        const lifeTimes = new Float32Array(this.settings.numPart);
        const velocities = new Float32Array(this.settings.numPart * 3);
        
        let attributes: { [key: string]: THREE.BufferAttribute } = {};
    
        if (this.settings.shader === 'galaxy') {
            const times = new Float32Array(this.settings.numPart);
            attributes = {
                a_time: new THREE.BufferAttribute(times, 1),
            };

            for (let i = 0; i < this.settings.numPart; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 10;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            }

        } else if (this.settings.shader === 'fireworks') {
    
            for (let i = 0; i < this.settings.numPart; i++) {

                // Posición inicial centrada
                positions[i * 3] = 0;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = 0;

                // Asignar una velocidad aleatoria para simular la explosión radial
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * this.settings.explosionForce;
                velocities[i * 3] = Math.cos(angle) * speed;
                velocities[i * 3 + 1] = Math.sin(angle) * speed;
                velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5 * this.settings.explosionForce;

                colors[i * 3] = Math.random();
                colors[i * 3 + 1] = Math.random();
                colors[i * 3 + 2] = Math.random();

                lifeTimes[i] = Math.random() * this.settings.lifeTime;

            }  

            attributes = {
                a_velocity: new THREE.BufferAttribute(velocities, 3),
                a_color: new THREE.BufferAttribute(colors, 3),
                a_lifeTime: new THREE.BufferAttribute(lifeTimes, 1),
            }

        } else if (this.settings.shader === 'wake') {
            this.particlesMaterial = this.wakeMaterial;
            this.createStarGeometry();
            
            const numParticles = this.settings.numPart;
            const trailColors = new Float32Array(numParticles  * 3);
            const trailOpacities = new Float32Array(numParticles );

            for (let i = 0; i < numParticles ; i++) {
                trailColors[i * 3] = this.settings.trailColor.r;
                trailColors[i * 3 + 1] = this.settings.trailColor.g;
                trailColors[i * 3 + 2] = this.settings.trailColor.b;
                trailOpacities[i] = 0.0;
            }

            attributes = {
                a_color: new THREE.BufferAttribute(trailColors, 3),
                a_opacity: new THREE.BufferAttribute(trailOpacities, 1),
                a_velocity: new THREE.BufferAttribute(velocities, 3),
                a_lifeTime: new THREE.BufferAttribute(lifeTimes, 1),
            };
            
            this.trail = new THREE.Points(this.particlesGeometry, this.wakeMaterial);
            this.scene.add(this.trail);
        }

        this.particlesGeometry = new THREE.BufferGeometry();
        this.particlesGeometry.setAttribute(
            'position', 
            new THREE.BufferAttribute(positions, 3)
        );
        
        for (const attributeName in attributes) {
            this.particlesGeometry.setAttribute(
                attributeName, 
                attributes[attributeName]
            );
        }
        
        this.particles = new THREE.Points(
            this.particlesGeometry, 
            this.particlesMaterial
        );

        this.scene.add(this.particles);
    }

    private setupGUI(): void {
        this.gui.add(this.settings, 'shader', ['galaxy', 'fireworks', 'wake']).name('Shader').onChange(() => {
            this.updateMaterial();
            this.createParticles();
        });
        
        this.gui.add(this.settings, 'particleSize', 1.0, 10.0, 0.1).name('Tam. Partículas');
        this.gui.add(this.settings, 'numPart', 100, 20000, 100).name('Num. Partículas').onChange(() => { this.createParticles(); });
        this.gui.add(this.settings, 'timeMultiplier', 1, 20, 0.1).name('Velocidad');
    
        // Parametros especificos de galaxy
        this.galaxyFolder = this.gui.addFolder('Galaxy Settings');
        this.galaxyFolder.add(this.settings, 'spiralFactor', 0.0, 2.0, 0.01).name('Factor Espiral');
        this.galaxyFolder.add(this.settings, 'radiusScale', 0.1, 2.0, 0.01).name('Escala Radio');

        // Parametros especificos de fireworks
        this.fireworksFolder = this.gui.addFolder('Fireworks Settings');
        this.fireworksFolder.add(this.settings, 'gravityX', -10, 10, 0.1).name('Gravedad X').onChange(() => { this.updateGravity(); });
        this.fireworksFolder.add(this.settings, 'gravityY', -10, 10, 0.1).name('Gravedad Y').onChange(() => { this.updateGravity(); });
        this.fireworksFolder.add(this.settings, 'gravityZ', -10, 10, 0.1).name('Gravedad Z').onChange(() => { this.updateGravity(); });
        this.fireworksFolder.add(this.settings, 'lifeTime', 1, 10, 0.1).name('Tiempo de vida').onChange(() => { this.updateLifeTime(); });
        
        // Parametros especificos de fireworks
        this.wakeFolder = this.gui.addFolder('Wake Settings');
        this.wakeFolder.add(this.settings, 'timeMultiplier', 1, 20, 0.1).name('Tiempo');
        this.wakeFolder.add(this.settings, 'opacity', 0.1, 1, 0.01).name('Opacidad');


        this.updateMaterial();
    }

    private updateWake(): void {
        if (this.settings.shader === 'wake' && this.trail) {
            const positions = this.trail.geometry.attributes.position.array as THREE.TypedArray;
            const opacities = this.trail.geometry.attributes.a_opacity.array as THREE.TypedArray;
            const numParticles = this.settings.numPart;

            for (let i = numParticles - 1; i > 0; i--) {
                positions[i * 3] = positions[(i - 1) * 3];
                positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
                positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
                opacities[i] = opacities[i - 1] * 0.99;
            }

            // La primera partícula sigue al objeto guía
            this.trail.geometry.attributes.position.array[0] = this.trailObject.position.x;
            this.trail.geometry.attributes.position.array[1] = this.trailObject.position.y;
            this.trail.geometry.attributes.position.array[2] = this.trailObject.position.z;
            this.trail.geometry.attributes.a_opacity.array[0] = 1.0;
            opacities[0] = this.settings.opacity;

            this.trail.geometry.attributes.position.needsUpdate = true;
            this.trail.geometry.attributes.a_opacity.needsUpdate = true;
        }
    }

    private updateGravity(): void {
        this.fireworksMaterial.uniforms.u_gravity.value.set(this.settings.gravityX, this.settings.gravityY, this.settings.gravityZ);
    }

    private updateLifeTime(): void {
        this.fireworksMaterial.uniforms.u_lifeTime.value = this.settings.lifeTime;
    }

    private updateMaterial(): void {
        if (this.settings.shader === 'galaxy') {
            this.particlesMaterial = this.galaxyMaterial;
            this.galaxyFolder.domElement.style.display = 'block';
            this.fireworksFolder.domElement.style.display = 'none';
            this.wakeFolder.domElement.style.display = 'none';
        
        } else if (this.settings.shader === 'fireworks') {
            this.particlesMaterial = this.fireworksMaterial;
            this.fireworksFolder.domElement.style.display = 'block';
            this.galaxyFolder.domElement.style.display = 'none';
            this.wakeFolder.domElement.style.display = 'none';
       
        } else if (this.settings.shader === 'wake') {
            
            this.particlesMaterial = this.wakeMaterial;
            this.wakeFolder.domElement.style.display = 'block';
            this.galaxyFolder.domElement.style.display = 'none';
            this.fireworksFolder.domElement.style.display = 'none';;
        }
        
        // Crear nuevas partículas con la configuración adecuada
        this.createParticles();
    }

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        const elapsedTime = ((Date.now() - this.startTime) / 1000) * this.settings.timeMultiplier;
        
        if (this.particlesMaterial && this.particlesMaterial.uniforms) {
            this.particlesMaterial.uniforms.u_time.value = elapsedTime;
            this.particlesMaterial.uniforms.u_particleSize.value = this.settings.particleSize;
            
            if (this.settings.shader === 'galaxy') {
                this.particlesMaterial.uniforms.u_spiralFactor.value = this.settings.spiralFactor;
                this.particlesMaterial.uniforms.u_radiusScale.value = this.settings.radiusScale;
            
            } else if (this.settings.shader === 'wake') {
                this.trailObject.position.x = Math.sin(elapsedTime * this.settings.baseSpeed) * 3;
                this.trailObject.position.y = Math.cos(elapsedTime * this.settings.baseSpeed * 0.5) * 2;
                this.trailObject.position.z = Math.cos(elapsedTime * this.settings.baseSpeed * 0.3) * 1;
                this.wakeMaterial.uniforms.u_opacity.value = this.settings.opacity;

                this.updateWake();
            }
        } 
    
        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const myApp = new App();