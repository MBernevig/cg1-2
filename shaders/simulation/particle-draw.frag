#version 410

uniform vec3 containerCenter;  // The position of the light source, which is at the center of the container.
uniform float ambientCoefficient;  // Ambient coefficient, controlled via GUI.
uniform vec3 lightColor;  // Color of the light source.
uniform bool useShading;  // Toggle shading on or off.

layout(location = 0) in vec3 fragPosition;
layout(location = 1) in vec3 fragNormal;
layout(location = 2) in vec3 fragVelocity;
layout(location = 3) in vec3 fragBounceData;

layout(location = 0) out vec4 fragColor;

uniform vec3 lowSpeedColor;
uniform vec3 highSpeedColor;
uniform float maxSpeed;

uniform vec3 blinkColor;
uniform bool enableBlink;

void main() {
    vec3 baseColor = vec3(1.0);

    // ===== Task 2.1 Speed-based Colors =====

    vec3 finalColor = baseColor;

    float currSpeed = length(fragVelocity);
    float speedFactor = currSpeed / maxSpeed;

    finalColor = mix(lowSpeedColor, highSpeedColor, speedFactor);

    // ===== Task 2.2 Shading =====
    if (useShading) {
        // Ambient shading term
        vec3 ambientTerm = ambientCoefficient * finalColor;

        // Diffuse shading term
        vec3 lightDir = normalize(containerCenter - fragPosition);  // Light direction from fragment to light source
        float diffuseFactor = max(dot(fragNormal, lightDir), 0.0);  // Diffuse factor based on angle between normal and light
        vec3 diffuseTerm = diffuseFactor * lightColor * finalColor;

        // Combine ambient and diffuse components
        finalColor = ambientTerm + diffuseTerm;
    }

    if(enableBlink) {
        finalColor = vec3(fragBounceData.y);
    }

    // Apply blink color if needed
    if (enableBlink && fragBounceData.y > 0.0) {
        finalColor = blinkColor;
    }

    fragColor = vec4(finalColor, 1.0);
}
