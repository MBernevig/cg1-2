#version 410
#extension GL_ARB_explicit_uniform_location : enable

uniform sampler2D previousPositions;
uniform sampler2D previousVelocities;
uniform sampler2D previousBounceData;
uniform float timestep;
uniform uint numParticles;
uniform float particleRadius;
uniform vec3 containerCenter;
uniform float containerRadius;
uniform bool interParticleCollision;

layout(location = 0) out vec3 finalPosition;
layout(location = 1) out vec3 finalVelocity;
layout(location = 2) out vec3 finalBounceData;

void main() {
    // Normalized texture coordinates for accessing particle data
    vec2 texCoords = gl_FragCoord.xy / vec2(textureSize(previousPositions, 0));

    // Fetch the current position and velocity of this particle
    vec3 currentPosition = texture(previousPositions, texCoords).xyz;
    vec3 currentVelocity = texture(previousVelocities, texCoords).xyz;

    // ===== Task 1.1 Verlet Integration =====
    vec3 acceleration = vec3(0, -9.81, 0);  // Gravity acceleration

    // Update the position using Verlet integration
    finalPosition = currentPosition + currentVelocity * timestep + 0.5 * acceleration * timestep * timestep;
    
    // Update the velocity
    finalVelocity = currentVelocity + acceleration * timestep;

    // Fetch the bounce data
    finalBounceData = texture(previousBounceData, texCoords).xyz;




    // ===== Task 1.3 Inter-particle Collision =====
    if (interParticleCollision) {
    }
    
    // ===== Task 1.2 Container Collision =====

}
