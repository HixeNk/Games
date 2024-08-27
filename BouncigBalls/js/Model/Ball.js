class Ball {
    constructor(x, y, radius, dx, dy, color = 'red', material = { name: 'Plastic', mass: 1 }) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.elasticity = 0.9;
        this.insideShape = null;
        this.timeMultiplier = 1;
        this.material = material;
        this.mass = material.mass;
        this.maxSpeed = 2;
        this.id = Math.random().toString(36).substr(2, 9);
        this.onCollision = null;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(canvas, shapes, balls) {
        if (isPaused) return;

        for (let i = 0; i < this.timeMultiplier; i++) {
            CollisionHandler.handleCanvasCollision(this, canvas);
            CollisionHandler.handleBallCollision(this, balls);

            for (let shape of shapes) {
                if (this.insideShape === shape) {
                    InsideShapeCollisionHandler.handleInsideShapeCollision(this, shape);
                } else {
                    OutsideShapeCollisionHandler.handleOutsideShapeCollision(this, shape);
                }
            }

            this.x += this.dx * this.timeMultiplier;
            this.y += this.dy * this.timeMultiplier;
            this.limitSpeed();
        }
    }
    
    limitSpeed() {
        const currentSpeed = Math.sqrt(this.dx ** 2 + this.dy ** 2);
        if (currentSpeed > this.maxSpeed) {
            const speedRatio = this.maxSpeed / currentSpeed;
            this.dx *= speedRatio;
            this.dy *= speedRatio;
        }
    }

    resolveShapeCollision(start, end, shape) {
        let normal = { x: end[1] - start[1], y: start[0] - end[0] };
        let length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= length;
        normal.y /= length;
    
        const dotProduct = this.dx * normal.x + this.dy * normal.y;
        this.dx -= 2 * dotProduct * normal.x;
        this.dy -= 2 * dotProduct * normal.y;
    
        // Корректировка позиции для предотвращения выхода из фигуры
        let closestPoint = this.findClosestPoint(shape);
        let distance = Math.sqrt((this.x - closestPoint.x) ** 2 + (this.y - closestPoint.y) ** 2);
        if (distance < this.radius) {
            let overlap = this.radius - distance;
            let unitNormal = { x: this.x - closestPoint.x, y: this.y - closestPoint.y };
            let normLength = Math.sqrt(unitNormal.x * unitNormal.x + unitNormal.y * unitNormal.y);
            unitNormal.x /= normLength;
            unitNormal.y /= normLength;
    
            this.x += unitNormal.x * overlap;
            this.y += unitNormal.y * overlap;
    
            this.dx *= this.elasticity;
            this.dy *= this.elasticity;
        }
    }
    
    

    findClosestPoint(shape) {
        let closestPoint = { x: this.x, y: this.y };
        let minDist = Infinity;
        
        for (let i = 0; i < shape.points.length; i++) {
            let start = shape.points[i];
            let end = shape.points[(i + 1) % shape.points.length];
            let projection = this.projectOntoLine(start, end);
            
            let dist = Math.sqrt((this.x - projection.x) ** 2 + (this.y - projection.y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                closestPoint = projection;
            }
        }
        
        return closestPoint;
    }
    
    
    
 projectOntoLine(start, end) {
    const lineLenSq = (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2;
    if (lineLenSq === 0) return { x: start[0], y: start[1] };
    
    const t = ((this.x - start[0]) * (end[0] - start[0]) + (this.y - start[1]) * (end[1] - start[1])) / lineLenSq;
    const clampedT = Math.max(0, Math.min(1, t));
    
    return {
        x: start[0] + clampedT * (end[0] - start[0]),
        y: start[1] + clampedT * (end[1] - start[1])
    };
}

    isCollidingWith(otherBall) {
        const dx = this.x - otherBall.x;
        const dy = this.y - otherBall.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + otherBall.radius);
    }

    isClicked(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.radius;
    }

    renderInMenu(container) {
        const ballElement = document.createElement('div');
        ballElement.classList.add('ball-item');
        ballElement.style.width = `${this.radius * 2}px`;
        ballElement.style.height = `${this.radius * 2}px`;
        ballElement.style.backgroundColor = this.color;
        ballElement.style.borderRadius = '50%';
        ballElement.style.position = 'relative';
        container.appendChild(ballElement);
    }
}