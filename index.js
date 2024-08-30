document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const balls = [];
        const controlPanel = new ControlPanel(balls);
        let isPaused = false;

        // Функция отрисовки
        function draw() {
            const ctx = document.getElementById('myCanvas').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
            controlPanel.shapeMenu.drawShapes(ctx);
        
            for (let ball of controlPanel.balls) {
                if (!controlPanel.isPaused) {
                    ball.update(canvas, controlPanel.shapeMenu.shapes, controlPanel.balls);
                }
                ball.draw(ctx);
            }
            controlPanel.contextMenu.updateBamTexts(ctx);
            requestAnimationFrame(draw);
        }
        
        window.draw = draw;

        // Контекстное меню для удаления шариков
        canvas.addEventListener('contextmenu', function (event) {
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

        draw();
    } else {
        console.error('Canvas element not found');
    }
});
