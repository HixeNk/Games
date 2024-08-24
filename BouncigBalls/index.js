document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const canvas = document.getElementById('myCanvas');
    if (canvas) {
     

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const balls = [];
        const controlPanel = new ControlPanel(balls);

        let isPaused = false;

        // Функция отрисовки шариков
        function draw() {
            if (controlPanel.isPaused) return;
            
            const ctx = document.getElementById('myCanvas').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
            for (let shape of controlPanel.shapes) { 
                shape.draw(ctx);
            }
        
            for (let ball of controlPanel.balls) {
                ball.update(canvas, controlPanel.shapes, controlPanel.balls);
                ball.draw(ctx);
            }
        
            requestAnimationFrame(draw);
        }
        

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
