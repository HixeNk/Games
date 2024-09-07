// Класс обработки столкновений шариков с фигурами изнутри
class InsideShapeCollisionHandler {
    static handleInsideShapeCollision(ball, shape) {
        const steps = 10;
        const stepDx = ball.dx / steps;
        const stepDy = ball.dy / steps;

        for (let i = 0; i < steps; i++) {
            ball.x += stepDx;
            ball.y += stepDy;

            if (!shape.contains(ball)) {
                ball.x -= stepDx;
                ball.y -= stepDy;

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

                const dotProduct = ball.dx * normal.x + ball.dy * normal.y;
                ball.dx -= 2 * dotProduct * normal.x;
                ball.dy -= 2 * dotProduct * normal.y;

                ball.dx *= ball.elasticity;
                ball.dy *= ball.elasticity;

                break;
            }
        }
    }
}
