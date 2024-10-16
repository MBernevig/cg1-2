#include "render/mesh.h"
#include "simulation/particles.h"
#include "simulation/sphere_container.h"
#include "ui/camera.h"
#include "ui/menu.h"
#include "utils/constants.h"

#include <framework/disable_all_warnings.h>
DISABLE_WARNINGS_PUSH()
#include <glad/glad.h> // Include glad before glfw3
#include <GLFW/glfw3.h>
#include <glm/mat4x4.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <imgui/imgui.h>
DISABLE_WARNINGS_POP()

#include <framework/window.h>

#include <functional>
#include <iostream> // For printing FPS to console

int main(int argc, char* argv[]) {
    // Init core objects
    Config m_config;
    Window m_window("Particle Simulation", glm::ivec2(utils::WIDTH, utils::HEIGHT), OpenGLVersion::GL41);
    Camera mainCamera(&m_window, utils::START_POSITION, utils::START_LOOK_AT);
    Menu menu(m_config);
    ParticlesSimulator particlesSimulator(m_config);
    SphereContainer sphereContainer(m_config);

    // Bind main draw framebuffer for option setting
    glBindFramebuffer(GL_FRAMEBUFFER, 0);

    // Set color used for clearing
    glClearColor(0.1f, 0.1f, 0.1f, 1.0f);

    // Enable depth test
    glEnable(GL_DEPTH_TEST);

    // FPS calculation variables
    double previousTime = glfwGetTime();
    int frameCount = 0;

    // Main loop
    while (!m_window.shouldClose()) {
        // Process user input
        m_window.updateInput();

        // View-projection matrix setup
        const glm::mat4 m_projection = glm::perspective(utils::FOV, utils::ASPECT_RATIO, 0.1f, 30.0f);
        const glm::mat4 m_viewProjection = m_projection * mainCamera.viewMatrix();

        // Bind main draw framebuffer
        glBindFramebuffer(GL_FRAMEBUFFER, 0);

        // Clear the screen
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // Reset the simulation if requested
        if (m_config.doResetSimulation) {
            particlesSimulator.resetSimulation();
            m_config.doResetSimulation = false;
        }

        // Particle simulation and rendering
        particlesSimulator.render(m_viewProjection);

        // Render container
        sphereContainer.draw(m_viewProjection);

        // Controls and UI
        ImGuiIO io = ImGui::GetIO();
        menu.draw();
        if (!io.WantCaptureMouse) { mainCamera.updateInput(); }

        // Swap the window buffer
        m_window.swapBuffers();

        // FPS calculation
        double currentTime = glfwGetTime();
        frameCount++;

        // If a second has passed
        if (currentTime - previousTime >= 1.0) {
            double fps = double(frameCount) / (currentTime - previousTime);
            std::cout << "FPS: " << fps << std::endl;

            // Reset for the next second
            previousTime = currentTime;
            frameCount = 0;
        }
    }

    return EXIT_SUCCESS;
}
