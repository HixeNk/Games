// Класс обработки столкновений шариков с фигурами снаружи
class OutsideShapeCollisionHandler {
    static handleOutsideShapeCollision(ball, shape) {
        if (shape.intersects(ball)) {
            for (let i = 0; i < shape.points.length; i++) {
                let start = shape.points[i];
                let end = shape.points[(i + 1) % shape.points.length];
                
                if (shape.lineIntersectsCircle(start[0], start[1], end[0], end[1], ball.x, ball.y, ball.radius)) {
                    ball.resolveShapeCollision(start, end, shape);

                    if (ball.onCollision) {
                        ball.onCollision(ball.x, ball.y);
                    }
                }
            }
        } else {
            let closestPoint = ball.findClosestPoint(shape);
            let dx = ball.x - closestPoint.x;
            let dy = ball.y - closestPoint.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball.radius) {
                let overlap = ball.radius - distance;
                let unitNormal = { x: dx / distance, y: dy / distance };

                ball.x = closestPoint.x + unitNormal.x * overlap;
                ball.y = closestPoint.y + unitNormal.y * overlap;

                let dotProduct = ball.dx * unitNormal.x + ball.dy * unitNormal.y;
                ball.dx -= 2 * dotProduct * unitNormal.x;
                ball.dy -= 2 * dotProduct * unitNormal.y;

                ball.dx *= ball.elasticity;
                ball.dy *= ball.elasticity;
            }
        }
    }
}
