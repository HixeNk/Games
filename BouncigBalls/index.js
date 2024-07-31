document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const shapes = [
            new CustomShape([[70, 70], [70, 650], [1450, 650],[1450,70],[1000,70],[1000,300],[500,300],[500,70]], 'orange'),
            new CustomShape([[700, 350], [800, 350],[870,420],[870,520],[800,590],[700,590],[630,520],[630,420]], 'lime'),
            new CustomShape([[250, 120], [320, 170],[320,250],[250,300],[180,250],[180,170]], 'blue'),
            new CustomShape([[250, 400],[350,400],[400,470],[300,570],[200,470]], 'red'),
            new CustomShape([[1100,150],[1300,150],[1300,330],[1100,330]], 'black'),
            new CustomShape([[1150,400],[1250,550],[1050,550]], 'purple')
        ];

        function isSafeToPlaceBall(x, y, radius, shapes) {
            for (let shape of shapes) {
                if (shape.distanceToPoint(x, y) < radius) {
                    return false;
                }
            }
            return true;
        }

        function generateSafeBall(x, y, radius, dx, dy, color, shapes) {
            while (!isSafeToPlaceBall(x, y, radius, shapes)) {
                x = Math.random() * canvas.width;
                y = Math.random() * canvas.height;
            }
            return new Ball(x, y, radius, dx, dy, color);
        }

        const balls = [];
        const controlPanel = new ControlPanel(balls);

        function draw() {
            if (isPaused) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let shape of shapes) {
                shape.draw(ctx);
            }

            for (let ball of balls) {
                ball.update(canvas, shapes, balls);
                ball.draw(ctx);
            }

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

        draw();
    } else {
        console.error('Canvas element not found');
    }
});