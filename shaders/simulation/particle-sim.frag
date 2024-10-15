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

layout(location = 0) out vec3 finalPosition;
layout(location = 1) out vec3 finalVelocity;
layout(location = 2) out vec3 finalBounceData;

void main() {
    
    vec2 texCoords = gl_FragCoord.xy / vec2(textureSize(previousPositions, 0));

    vec3 currentPosition = texture(previousPositions, texCoords).xyz;
    vec3 currentVelocity = texture(previousVelocities, texCoords).xyz;

    // ===== Task 1.1 Verlet Integration =====
    vec3 acceleration = vec3(0, -9.81, 0);  // Gravity acceleration

    finalPosition = currentPosition + currentVelocity * timestep + 0.5 * acceleration * timestep * timestep;
    
    finalVelocity = currentVelocity + acceleration * timestep;

    finalBounceData = texture(previousBounceData, texCoords).xyz;




    if (interParticleCollision) {
        // Loop over all other particles
        for (uint i = 0; i < numParticles; ++i) {
            // Fetch the other particle's position
            vec2 otherTexCoords = vec2(float(i) / float(numParticles), 0.0);  // Simplified texture coordinate sampling for demo
        
            vec3 otherPosition = texture(previousPositions, otherTexCoords).xyz;
            vec3 otherVelocity = texture(previousVelocities, otherTexCoords).xyz;

            // Ensure we do not check the same particle against itself
            if (otherPosition == currentPosition) continue;

            // Compute distance between particles
            vec3 deltaPos = finalPosition - otherPosition;
            float dist = length(deltaPos);
        
            if (dist < 2.0 * particleRadius - 0.005f) {  // Collision detected
                // Calculate the normal at the point of collision
                vec3 normal = normalize(deltaPos);
            
                // Nudge the particles apart to avoid overlap
                float overlap = 2.0 * particleRadius - dist;
                finalPosition += normal * overlap * 1.0001;

               
                if( collisionsCauseRelativeVelocity ){
				    //Reflect the velocities of both particles along the normal
                    vec3 relativeVelocity = finalVelocity - otherVelocity;
                    float normalSpeed = dot(relativeVelocity, normal);
                    
                    if (normalSpeed < 0.0) {
                        finalVelocity -= normal * normalSpeed;
                    }
				} else {
                    finalVelocity = reflect(finalVelocity, normal);
                }
                
            }
        }
    }

    
    // ===== Task 1.2 Container Collision =====

    float damp = 1.0f;
    if (addDamping) {
		damp = dampingFactor;
    } else {
		damp = 1.0f;
	}

    float distance = length(finalPosition - containerCenter);
    if (distance >= containerRadius - particleRadius - 0.005f) {
        // Reflect the position and velocity
        vec3 normal = normalize(finalPosition - containerCenter);
        finalPosition = containerCenter + normal * (containerRadius - particleRadius - 0.005f);
    
        // Reflect the velocity and apply damping
        finalVelocity = reflect(finalVelocity, normal) * damp;
    }

}
