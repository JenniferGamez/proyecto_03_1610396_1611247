precision mediump float;

// Uniforms
uniform sampler2D tDiffuse; // Textura renderizada
uniform vec2 resolution;    // Resolución de la pantalla
uniform float intensity;    // Intensidad del Bloom

// Varying
in vec2 vUv; // Coordenadas UV

// Output
out vec4 fragColor; // Color de salida

void main() {
    // Color original del píxel
    vec4 color = texture(tDiffuse, vUv);

    // Aplicar desenfoque a las áreas brillantes con pesos variables
    vec4 blurredColor = vec4(0.0);
    float weightSum = 0.0;
    
    for (float x = -1.0; x <= 1.0; x++) {
        for (float y = -1.0; y <= 1.0; y++) {
            vec2 offset = vec2(x, y) / resolution; // Desplazamiento normalizado
            float weight = 1.0 - (abs(x) + abs(y)) * 0.3; // Peso decreciente según la distancia
            blurredColor += texture(tDiffuse, vUv + offset) * weight;
            weightSum += weight;
        }
    }
    
    blurredColor /= weightSum; // Normalizar por los pesos

    fragColor = color + blurredColor * intensity;
}
