document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const balls = [];
        const controlPanel = new ControlPanel(balls);
        let isPaused = false;

        // Создаем экземпляр ShapeMenu
        const shapeMenu = new ShapeMenu(draw);

        // Инициализируем стандартные фигуры
        shapeMenu.shapes = [
            new CustomShape([[70, 70], [70, 650], [1450, 650], [1450, 70], [1000, 70], [1000, 300], [500, 300], [500, 70]], 'orange'),
            new CustomShape([[700, 350], [800, 350], [870, 420], [870, 520], [800, 590], [700, 590], [630, 520], [630, 420]], 'lime'),
            new CustomShape([[250, 120], [320, 170], [320, 250], [250, 300], [180, 250], [180, 170]], 'blue'),
            new CustomShape([[250, 400], [350, 400], [400, 470], [300, 570], [200, 470]], 'red'),
            new CustomShape([[1100, 150], [1300, 150], [1300, 330], [1100, 330]], 'black'),
            new CustomShape([[1150, 400], [1250, 550], [1050, 550]], 'purple')
        ];

        // Сохраняем экземпляр ShapeMenu в controlPanel
        controlPanel.shapeMenu = shapeMenu;

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