class VertexCollisionHandler {
    static resolveVertexCollision(ball, vertex) {
        const dx = ball.x - vertex[0];
        const dy = ball.y - vertex[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance < ball.radius) {
            const overlap = ball.radius - distance;
            const unitNormal = { x: dx / distance, y: dy / distance };
    
            ball.x += unitNormal.x * overlap;
            ball.y += unitNormal.y * overlap;
    
            const dotProduct = ball.dx * unitNormal.x + ball.dy * unitNormal.y;
            ball.dx -= 2 * dotProduct * unitNormal.x;
            ball.dy -= 2 * dotProduct * unitNormal.y;
    
            ball.dx *= ball.elasticity;
            ball.dy *= ball.elasticity;
    
            const buffer = 2; 
            ball.x += ball.dx * buffer;
            ball.y += ball.dy * buffer;
    
            ball.limitSpeed();
        }
    }
}