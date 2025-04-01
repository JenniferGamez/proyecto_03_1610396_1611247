import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelLoader {
    static loadModel(path: string, onLoadCallback: (model: THREE.Group) => void): void {
        const loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                onLoadCallback(model); // Envía el modelo cargado al callback
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% cargado');
            },
            (error) => {
                console.error('Error al cargar el modelo:', error);
            }
        );
    }
}