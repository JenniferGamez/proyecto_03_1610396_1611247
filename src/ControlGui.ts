import { GUI } from 'dat.gui';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export class ControlGui {
    private gui: GUI;
    private bloomSettings: { intensity: number };

    constructor(bloomPass: ShaderPass) {
        this.gui = new GUI();

        // Configuración inicial
        this.bloomSettings = {
            intensity: bloomPass.material.uniforms.intensity.value,
        };

        // Carpeta GUI para el efecto Bloom
        const bloomFolder = this.gui.addFolder('Bloom Effect');

        bloomFolder
            .add(this.bloomSettings, 'intensity', 0.0, 10.0)
            .step(0.1)
            .name('Intensity')
            .onChange((value) => {
                bloomPass.material.uniforms.intensity.value = value;
            });

        bloomFolder.open();
    }
}