class BallCollisionResolver {
    static resolveBallCollision(ball1, ball2) {
        // Расчет вектора нормали между двумя мячами
        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Если мячи не пересекаются, не нужно выполнять расчеты
        if (distance >= ball1.radius + ball2.radius) {
            return;
        }

        // Расчет вектора нормали
        const normalX = dx / distance;
        const normalY = dy / distance;

        // Расчет относительных скоростей
        const relativeVelocityX = ball2.dx - ball1.dx;
        const relativeVelocityY = ball2.dy - ball1.dy;
        const dotProduct = normalX * relativeVelocityX + normalY * relativeVelocityY;

        // Расчет массы
        const totalMass = ball1.mass + ball2.mass;

        // Расчет импульса
        const coefficientOfRestitution = Math.min(ball1.elasticity, ball2.elasticity);
        const impulse = (2 * dotProduct) / totalMass;

        // Обновление скоростей
        ball1.dx += impulse * ball2.mass * normalX * coefficientOfRestitution;
        ball1.dy += impulse * ball2.mass * normalY * coefficientOfRestitution;
        ball2.dx -= impulse * ball1.mass * normalX * coefficientOfRestitution;
        ball2.dy -= impulse * ball1.mass * normalY * coefficientOfRestitution;

        // Обновление позиций для предотвращения перекрытий
        const overlap = ball1.radius + ball2.radius - distance;
        if (overlap > 0) {
            const moveX = normalX * overlap / 2;
            const moveY = normalY * overlap / 2;
            ball1.x -= moveX;
            ball1.y -= moveY;
            ball2.x += moveX;
            ball2.y += moveY;
        }
    }
}
