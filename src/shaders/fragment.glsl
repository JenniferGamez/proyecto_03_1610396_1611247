precision mediump float;

// Uniforms
uniform sampler2D tDiffuse; // Textura renderizada
uniform vec2 resolution;    // Resolución de la pantalla
uniform float intensity;    // Intensidad del Bloom

// Varying
in vec2 vUv; // Coordenadas UV

// Output
out vec4 fragColor; // Color de salida

float luminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

void main() {
    vec4 texel = texture(tDiffuse, vUv);
    
    // Obtener el color original del píxel
    vec4 color = texture(tDiffuse, vUv);

    // Aplicar desenfoque a las áreas brillantes
    vec4 blurredColor = vec4(0.0);
    for (float x = -1.0; x <= 1.0; x++) {
        for (float y = -1.0; y <= 1.0; y++) {
            vec2 offset = vec2(x, y) / resolution; // Desplazamiento normalizado
            blurredColor += texture(tDiffuse, vUv + offset);
        }
    }
    blurredColor /= 9.0; // Normalizar el promedio de colores en el kernel

    // Combina el color original con el Bloom desenfocado
    fragColor = color + blurredColor * intensity;
}



