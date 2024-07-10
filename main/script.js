document.addEventListener('DOMContentLoaded', function() {
            const text = document.querySelector('.container');

            text.addEventListener('click', function() {
                let initialY = 0;           // Initial vertical position
                let gravity = 0.5;          // Gravity value
                let bounceFactor = 0.6;     // Bounce factor after hitting the ground
                let rotationFactor = 20;    // Rotation angle

                function drop() {
                    let posY = initialY + gravity;  // Calculate new vertical position
                    gravity *= bounceFactor;        // Adjust gravity for bounce effect

                    // Check if the text has hit the bottom of the window
                    if (posY + text.offsetHeight >= window.innerHeight) {
                        // Adjust position and reverse gravity for bounce effect
                        posY = window.innerHeight - text.offsetHeight;
                        gravity = -gravity * bounceFactor;
                    }

                    // Apply transform to the text element (translateY and rotate)
                    text.style.transform = `translateY(${posY}px) rotate(${rotationFactor}deg)`;
                    rotationFactor = -rotationFactor;  // Invert rotation for next iteration
                    initialY = posY;  // Update initial position to current position

                    // Continue animation if gravity is still significant
                    if (Math.abs(gravity) > 0.1) {
                        requestAnimationFrame(drop);  // Request next frame
                    }
                }

                drop();  // Start the drop animation
            });
        });
