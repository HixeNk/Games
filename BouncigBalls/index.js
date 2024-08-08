document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const balls = [];
        const controlPanel = new ControlPanel(balls);

        let isPaused = false;

        function draw() {
            if (isPaused) return;
        
            const ctx = document.getElementById('myCanvas').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
            // Отрисовка фигур
            for (let shape of controlPanel.shapes) { // Use controlPanel.shapes
                shape.draw(ctx);
            }
        
            // Обновление и отрисовка шариков
            for (let ball of controlPanel.balls) {
                ball.update(canvas, controlPanel.shapes, controlPanel.balls);
                ball.draw(ctx);
            }
        
            // Запуск следующего кадра анимации
            requestAnimationFrame(draw);
        }

        // Make draw globally accessible
        window.draw = draw;

        canvas.addEventListener('contextmenu', function(event) {
            event.preventDefault();

            if (!isPaused) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            for (let i = balls.length - 1; i >= 0; i--) {
                let ball = balls[i];
                const dx = x - ball.x;
                const dy = y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < ball.radius) {
                    balls.splice(i, 1);
                    draw();
                    break;
                }
            }
        });

        // Инициализация анимации
        draw();
    } else {
        console.error('Canvas element not found');
    }
});
