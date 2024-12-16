// Класс обработки столкновения с фигурами
class ShapeCollisionHandler {
    static resolveCollision(ball, start, end, shape) {
        let normal = { x: end[1] - start[1], y: start[0] - end[0] };
        let length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= length;
        normal.y /= length;

        const dotProduct = ball.dx * normal.x + ball.dy * normal.y;
        ball.dx -= 2 * dotProduct * normal.x;
        ball.dy -= 2 * dotProduct * normal.y;

        let closestPoint = ShapeCollisionHandler.findClosestPoint(ball, shape);
        let distance = Math.sqrt((ball.x - closestPoint.x) ** 2 + (ball.y - closestPoint.y) ** 2);
        if (distance < ball.radius) {
            let overlap = ball.radius - distance;
            let unitNormal = { x: ball.x - closestPoint.x, y: ball.y - closestPoint.y };
            let normLength = Math.sqrt(unitNormal.x * unitNormal.x + unitNormal.y * unitNormal.y);
            unitNormal.x /= normLength;
            unitNormal.y /= normLength;

            ball.x += unitNormal.x * overlap;
            ball.y += unitNormal.y * overlap;

            ball.dx *= ball.elasticity;
            ball.dy *= ball.elasticity;
        }
    }

    static findClosestPoint(ball, shape) {
        let closestPoint = { x: ball.x, y: ball.y };
        let minDist = Infinity;

        for (let i = 0; i < shape.points.length; i++) {
            let start = shape.points[i];
            let end = shape.points[(i + 1) % shape.points.length];
            let projection = ShapeCollisionHandler.projectOntoLine(ball, start, end);

            let dist = Math.sqrt((ball.x - projection.x) ** 2 + (ball.y - projection.y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                closestPoint = projection;
            }
        }

        return closestPoint;
    }

    static projectOntoLine(ball, start, end) {
        const lineLenSq = (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2;
        if (lineLenSq === 0) return { x: start[0], y: start[1] };

        const t = ((ball.x - start[0]) * (end[0] - start[0]) + (ball.y - start[1]) * (end[1] - start[1])) / lineLenSq;
        const clampedT = Math.max(0, Math.min(1, t));

        return {
            x: start[0] + clampedT * (end[0] - start[0]),
            y: start[1] + clampedT * (end[1] - start[1])
        };
    }
}
