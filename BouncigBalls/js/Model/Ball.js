// Класс с физикой шариков
class Ball {
    constructor(x, y, radius, dx, dy, color = 'red', material = { name: 'Plastic', mass: 1 }) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.initialDx = dx;
        this.initialDy = dy;
        this.color = color;
        this.elasticity = 0.9; 
        this.insideShape = null;
        this.timeMultiplier = 1;
        this.selectedMaterial = null;
        this.material = material;
        this.mass = material.mass;
        this.maxSpeed = 2;
        this.id = Math.random().toString(36).substr(2, 9);
        this.onCollision = null;
    }

    // Отрисовка шарикво
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    // Обновление позиций шариков на поле
    update(canvas, shapes, balls) {
        if (isPaused) return;

        for (let i = 0; i < this.timeMultiplier; i++) {
            this.handleCanvasCollision(canvas);
            this.handleBallCollision(balls);

            for (let shape of shapes) {
                if (this.insideShape === shape) {
                    this.handleInsideShapeCollision(shape);
                } else {
                    this.handleOutsideShapeCollision(shape);
                }
            }

            this.x += this.dx * this.timeMultiplier;
            this.y += this.dy * this.timeMultiplier;
            this.limitSpeed();
        }
    }

   // Общий лимит скорости шариков
   limitSpeed() {
        const maxSpeed = this.maxSpeed; 
        const currentSpeed = Math.sqrt(this.dx ** 2 + this.dy ** 2);

        if (currentSpeed > maxSpeed) {
            const speedRatio = maxSpeed / currentSpeed;
            this.dx *= speedRatio;
            this.dy *= speedRatio;
        }
    }

    // Коллизия шариков с канвасом
    handleCanvasCollision(canvas) {
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx * this.elasticity;
            this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy * this.elasticity;
            this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
        }
    }

    // Вызов коллизии шариков
    handleBallCollision(balls) {
        for (let ball of balls) {
            if (ball !== this && this.isCollidingWith(ball)) {
                this.resolveBallCollision(ball);
            }
        }
    }

    // Определение столкновений исходя из дистанции и радиуса шарика
    isCollidingWith(ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + ball.radius;
    }

    // Коллизия шариков
    resolveBallCollision(otherBall) {
        const dx = otherBall.x - this.x;
        const dy = otherBall.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance < this.radius + otherBall.radius) {
            const unitNormal = { x: dx / distance, y: dy / distance };
            const unitTangent = { x: -unitNormal.y, y: unitNormal.x };
            const v1n = unitNormal.x * this.dx + unitNormal.y * this.dy;
            const v1t = unitTangent.x * this.dx + unitTangent.y * this.dy;
            const v2n = unitNormal.x * otherBall.dx + unitNormal.y * otherBall.dy;
            const v2t = unitTangent.x * otherBall.dx + unitTangent.y * otherBall.dy;
    
            const v1nNew = (v1n * (this.mass - otherBall.mass) + 2 * otherBall.mass * v2n) / (this.mass + otherBall.mass);
            const v2nNew = (v2n * (otherBall.mass - this.mass) + 2 * this.mass * v1n) / (this.mass + otherBall.mass);
    
            const v1nVector = { x: v1nNew * unitNormal.x, y: v1nNew * unitNormal.y };
            const v1tVector = { x: v1t * unitTangent.x, y: v1t * unitTangent.y };
            const v2nVector = { x: v2nNew * unitNormal.x, y: v2nNew * unitNormal.y };
            const v2tVector = { x: v2t * unitTangent.x, y: v2t * unitTangent.y };
    
            this.dx = v1nVector.x + v1tVector.x;
            this.dy = v1nVector.y + v1tVector.y;
            otherBall.dx = v2nVector.x + v2tVector.x;
            otherBall.dy = v2nVector.y + v2tVector.y;
    
            const overlap = this.radius + otherBall.radius - distance;
            const separationFactor = overlap / (this.mass + otherBall.mass);
            this.x -= unitNormal.x * separationFactor * otherBall.mass;
            this.y -= unitNormal.y * separationFactor * otherBall.mass;
            otherBall.x += unitNormal.x * separationFactor * this.mass;
            otherBall.y += unitNormal.y * separationFactor * this.mass;
    
            this.limitSpeed();
            otherBall.limitSpeed();
        }
    }
    
    // Коллизия шариков внутри фигур
    handleInsideShapeCollision(shape) {
        if (!shape.contains(this)) {
            let closestPoint = this.findClosestPoint(shape);
            let dx = this.x - closestPoint.x;
            let dy = this.y - closestPoint.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius) {
                let overlap = this.radius - distance;
                let unitNormal = { x: dx / distance, y: dy / distance };

                this.x += unitNormal.x * overlap;
                this.y += unitNormal.y * overlap;

                const dotProduct = this.dx * unitNormal.x + this.dy * unitNormal.y;
                this.dx -= 2 * dotProduct * unitNormal.x;
                this.dy -= 2 * dotProduct * unitNormal.y;

                this.dx *= this.elasticity;
                this.dy *= this.elasticity;

                if (this.onCollision) {
                    this.onCollision(this.x, this.y);
                }
            }
        }

        for (let i = 0; i < shape.points.length; i++) {
            let start = shape.points[i];
            let end = shape.points[(i + 1) % shape.points.length];
            if (shape.lineIntersectsCircle(start[0], start[1], end[0], end[1], this.x, this.y, this.radius)) {
                this.resolveShapeCollision(start, end, shape);

                if (this.onCollision) {
                    this.onCollision(this.x, this.y);
                }
            }
        }
    }

    // Коллизия шариков вне фигур
    handleOutsideShapeCollision(shape) {
        if (shape.intersects(this)) {
            for (let i = 0; i < shape.points.length; i++) {
                let start = shape.points[i];
                let end = shape.points[(i + 1) % shape.points.length];
                if (shape.lineIntersectsCircle(start[0], start[1], end[0], end[1], this.x, this.y, this.radius)) {
                    this.resolveShapeCollision(start, end, shape);

                    if (this.onCollision) {
                        this.onCollision(this.x, this.y);
                    }
                }
            }
        } else {
            let closestPoint = this.findClosestPoint(shape);
            let dx = this.x - closestPoint.x;
            let dy = this.y - closestPoint.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius) {
                let overlap = this.radius - distance;
                let unitNormal = { x: dx / distance, y: dy / distance };

                this.x += unitNormal.x * overlap;
                this.y += unitNormal.y * overlap;

                this.resolveShapeCollision(closestPoint, closestPoint, shape);

                if (this.onCollision) {
                    this.onCollision(this.x, this.y);
                }
            }
        }
    }

    // Нахождение ближайшей точки столкновени ямежду шариком и фигурой
    findClosestPoint(shape) {
        let closestDistance = Infinity;
        let closestPoint = null;

        for (let i = 0; i < shape.points.length; i++) {
            let start = shape.points[i];
            let end = shape.points[(i + 1) % shape.points.length];
            let point = this.closestPointOnSegment(start[0], start[1], end[0], end[1]);
            let dx = this.x - point.x;
            let dy = this.y - point.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        }

        return closestPoint;
    }


    closestPointOnSegment(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;

        let t = dx * (this.x - x1) + dy * (this.y - y1);
        t = Math.max(0, Math.min(length, t));

        return {
            x: x1 + t * dx,
            y: y1 + t * dy
        };
    }

    // Коллизия между шариками, углами и вершинами
    resolveVertexCollision(vertex) {
        const dx = this.x - vertex[0];
        const dy = this.y - vertex[1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius) {
            const overlap = this.radius - distance;
            const unitNormal = { x: dx / distance, y: dy / distance };

            this.x += unitNormal.x * overlap;
            this.y += unitNormal.y * overlap;

            const dotProduct = this.dx * unitNormal.x + this.dy * unitNormal.y;
            this.dx -= 2 * dotProduct * unitNormal.x;
            this.dy -= 2 * dotProduct * unitNormal.y;

            this.dx *= this.elasticity;
            this.dy *= this.elasticity;

            const buffer = 2.0; 
            this.x += this.dx * buffer;
            this.y += this.dy * buffer;

            this.limitSpeed();
        }
    }

    // Столкновение между шариками и фигурами
    resolveShapeCollision(start, end, shape) {
        let normal = { x: end[1] - start[1], y: start[0] - end[0] };
        let length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= length;
        normal.y /= length;

        const dotProduct = this.dx * normal.x + this.dy * normal.y;
        this.dx -= 2 * dotProduct * normal.x;
        this.dy -= 2 * dotProduct * normal.y;

        const elasticityFactor = 0.8; 
        this.dx *= Math.max(this.elasticity, elasticityFactor);
        this.dy *= Math.max(this.elasticity, elasticityFactor);

        const buffer = 2.0; 
        this.x += this.dx * buffer;
        this.y += this.dy * buffer;

        for (let i = 0; i < shape.points.length; i++) {
            this.resolveVertexCollision(shape.points[i]);
        }

        this.limitSpeed();
    }

    // Распознавание нажатия по шарику
    isClicked(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.radius;
    }

    // Создание шарика в контейнере
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


