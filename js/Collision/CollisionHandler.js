// Класс обработки столкновений между шариками и между шариками и границами поля
class CollisionHandler {
    static handleCanvasCollision(ball, canvas) {
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx * ball.elasticity;
            ball.x = Math.max(ball.radius, Math.min(ball.x, canvas.width - ball.radius));
        }
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy = -ball.dy * ball.elasticity;
            ball.y = Math.max(ball.radius, Math.min(ball.y, canvas.height - ball.radius));
        }
    }

    static handleBallCollision(ball, balls) {
        for (let otherBall of balls) {
            if (otherBall !== ball && ball.isCollidingWith(otherBall)) {
                BallCollisionResolver.resolveBallCollision(ball, otherBall);
            }
        }
    }
}