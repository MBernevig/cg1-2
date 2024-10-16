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

uniform bool addDamping;
uniform float dampingFactor;
uniform bool collisionsCauseRelativeVelocity;

uniform float maxCollisions;
uniform float colorFrames;

layout(location = 0) out vec3 finalPosition;
layout(location = 1) out vec3 finalVelocity;
layout(location = 2) out vec3 finalBounceData;

void main() {

    bool collided = false;
    
    vec2 texCoords = gl_FragCoord.xy / vec2(textureSize(previousPositions, 0));

    vec3 currentPosition = texture(previousPositions, texCoords).xyz;
    vec3 currentVelocity = texture(previousVelocities, texCoords).xyz;

    // ===== Task 1.1 Verlet Integration =====
    vec3 acceleration = vec3(0, -9.81, 0);  // Gravity acceleration

    finalPosition = currentPosition + currentVelocity * timestep + 0.5 * acceleration * timestep * timestep;
    finalVelocity = currentVelocity + acceleration * timestep;
    
    if (interParticleCollision) {
        for (uint i = 0; i < numParticles; ++i) {
            vec2 otherTexCoords = vec2(float(i) / float(numParticles), 0.0);  
            vec3 otherPosition = texture(previousPositions, otherTexCoords).xyz;
            vec3 otherVelocity = texture(previousVelocities, otherTexCoords).xyz;

            if (otherPosition == currentPosition) continue;

            vec3 deltaPos = finalPosition - otherPosition;
            float dist = length(deltaPos);
        
            if (dist < 2.0 * particleRadius - 0.005f) {
                vec3 normal = normalize(deltaPos);
                float overlap = 2.0 * particleRadius - dist;
                finalPosition += normal * overlap * 1.0001;

                if (collisionsCauseRelativeVelocity) {
                    vec3 relativeVelocity = finalVelocity - otherVelocity;
                    float normalSpeed = dot(relativeVelocity, normal);
                    if (normalSpeed < 0.0) {
                        finalVelocity -= normal * normalSpeed;
                    }
                } else {
                    finalVelocity = reflect(finalVelocity, normal);
                }

                collided = true;
            }
        }
    }

    float damp = addDamping ? dampingFactor : 1.0f;
    float distance = length(finalPosition - containerCenter);
    if (distance >= containerRadius - particleRadius - 0.005f) {
        vec3 normal = normalize(finalPosition - containerCenter);
        finalPosition = containerCenter + normal * (containerRadius - particleRadius - 0.005f);
        finalVelocity = reflect(finalVelocity, normal) * damp;
        collided = true;
    }

    // ===== Part 3: Bounce Blinks =====
    vec2 bounceData = texture(previousBounceData, texCoords).xy;

    float bounces = bounceData.x;
    float frames = bounceData.y;

    if (collided && frames < 1.0f) {
        
        bounces += 1.0;
        if (bounces >= maxCollisions) {
            bounces = 0.0;
            frames = colorFrames;
        }
    } else {
        frames = max(0.0, frames-1.0f);
    }

    finalBounceData = vec3(bounces, frames, 0.0);
}
