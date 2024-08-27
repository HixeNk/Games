class InsideShapeCollisionHandler {
    static handleInsideShapeCollision(ball, shape) {
        const steps = 10; // Количество подшагов для более точного обнаружения выхода за границу
        const stepDx = ball.dx / steps;
        const stepDy = ball.dy / steps;

        for (let i = 0; i < steps; i++) {
            ball.x += stepDx;
            ball.y += stepDy;

            if (!shape.contains(ball)) {
                // Откатываем его движение назад
                ball.x -= stepDx;
                ball.y -= stepDy;

                // Возвращаем его внутрь, находя ближайшую точку на границе фигуры
                let closestPoint = ball.findClosestPoint(shape);
                let normal = {
                    x: ball.x - closestPoint.x,
                    y: ball.y - closestPoint.y
                };
                const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
                normal.x /= length;
                normal.y /= length;

                ball.x = closestPoint.x + normal.x * ball.radius;
                ball.y = closestPoint.y + normal.y * ball.radius;

                // Пересчитываем скорость
                const dotProduct = ball.dx * normal.x + ball.dy * normal.y;
                ball.dx -= 2 * dotProduct * normal.x;
                ball.dy -= 2 * dotProduct * normal.y;

                // Применяем коэффициент упругости
                ball.dx *= ball.elasticity;
                ball.dy *= ball.elasticity;

                break;
            }
        }
    }
}
