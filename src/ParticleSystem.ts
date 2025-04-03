import * as THREE from 'three';

export class ParticleSystem {
    private scene: THREE.Scene;
    private particlesGeometry!: THREE.BufferGeometry;
    private particlesMaterial!: THREE.PointsMaterial;
    private particles!: THREE.Points;
    private particlesCount: number = 100;
    private particleSpeeds: Float32Array = new Float32Array(this.particlesCount);
    private particleOpacities: Float32Array = new Float32Array(this.particlesCount);

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public createParticles(model: THREE.Object3D): void {
        this.particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particlesCount * 3);
        const colors = new Float32Array(this.particlesCount * 3);

        for (let i = 0; i < this.particlesCount; i++) {
            const vertex = new THREE.Vector3();
            vertex.x = (Math.random() - 0.5) * 3;
            vertex.y = (Math.random() - 0.5) * 3;
            vertex.z = (Math.random() - 0.5) * 3;

            positions[i * 3] = vertex.x;
            positions[i * 3 + 1] = vertex.y;
            positions[i * 3 + 2] = vertex.z;

            const color = new THREE.Color(0xffff00);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            this.particleSpeeds[i] = Math.random() * 0.02 + 0.01;
            this.particleOpacities[i] = 1.0;
        }

        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
        });

        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
        this.scene.add(this.particles);

        // Hacer que las partículas sigan al modelo
        this.particles.position.copy(model.position);
    }

    public animateParticles(): void {
        if (this.particles) {
            const positions = this.particlesGeometry.attributes.position.array as number[];
            const colors = this.particlesGeometry.attributes.color.array as number[];
            let allParticlesDead = true;

            for (let i = 0; i < this.particlesCount; i++) {
                positions[i * 3 + 1] += this.particleSpeeds[i];
                this.particleOpacities[i] -= 0.001;

                if (this.particleOpacities[i] > 0) {
                    allParticlesDead = false;
                }

                colors[i * 3 + 3] = this.particleOpacities[i];
            }

            this.particlesGeometry.attributes.position.needsUpdate = true;
            this.particlesGeometry.attributes.color.needsUpdate = true;

            if (allParticlesDead) {
                this.resetParticles();
            }
        }
    }

    private resetParticles(): void {
        const positions = this.particlesGeometry.attributes.position.array as number[];
        const colors = this.particlesGeometry.attributes.color.array as number[];

        for (let i = 0; i < this.particlesCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 3;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
            this.particleOpacities[i] = 1.0;

            const color = new THREE.Color(0xffff00);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.particlesGeometry.attributes.position.needsUpdate = true;
        this.particlesGeometry.attributes.color.needsUpdate = true;
    }
}