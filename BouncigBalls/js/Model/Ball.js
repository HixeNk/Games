// Класс для шариков
class Ball {
    constructor(x, y, radius, dx, dy, color = 'red', material = {name: 'Plastic', mass: 1}) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.initialDx = dx;
        this.initialDy = dy;
        this.color = color;
        this.elasticity = 1.0;
        this.insideShape = null;
        this.timeMultiplier = 1;
        this.material = material;
        this.mass = material.mass;
    }

    // Метод для отрисовки шарика
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    // Метод для обновления положения и обработки столкновений
    update(canvas, shapes, balls) {
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

            this.x += this.dx;
            this.y += this.dy;
        }
    }

    // Метод обработки столкновения с границами канваса
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

    // Метод обработки столкновений с другими шариками
    handleBallCollision(balls) {
        for (let ball of balls) {
            if (ball !== this && this.isCollidingWith(ball)) {
                this.resolveBallCollision(ball);
            }
        }
    }

    // Метод проверки столкновения с другим шариком
    isCollidingWith(ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + ball.radius;
    }

    // Метод столкновения между шариками
    resolveBallCollision(ball) {
        // Вектор нормали
        const normal = { x: ball.x - this.x, y: ball.y - this.y };
        const distance = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        const unitNormal = { x: normal.x / distance, y: normal.y / distance };
        const unitTangent = { x: -unitNormal.y, y: unitNormal.x };

        // Скорости вдоль нормали и касательной
        const thisNormalVelocity = unitNormal.x * this.dx + unitNormal.y * this.dy;
        const thisTangentVelocity = unitTangent.x * this.dx + unitTangent.y * this.dy;
        const ballNormalVelocity = unitNormal.x * ball.dx + unitNormal.y * ball.dy;
        const ballTangentVelocity = unitTangent.x * ball.dx + unitTangent.y * ball.dy;

        // Новые скорости вдоль нормали
        const thisNewNormalVelocity = ((thisNormalVelocity * (this.mass - ball.mass) + 2 * ball.mass * ballNormalVelocity) / (this.mass + ball.mass));
        const ballNewNormalVelocity = ((ballNormalVelocity * (ball.mass - this.mass) + 2 * this.mass * thisNormalVelocity) / (this.mass + ball.mass));

        // Применение новых скоростей
        this.dx = unitNormal.x * thisNewNormalVelocity + unitTangent.x * thisTangentVelocity;
        this.dy = unitNormal.y * thisNewNormalVelocity + unitTangent.y * thisTangentVelocity;
        ball.dx = unitNormal.x * ballNewNormalVelocity + unitTangent.x * ballTangentVelocity;
        ball.dy = unitNormal.y * ballNewNormalVelocity + unitTangent.y * ballTangentVelocity;

        // Коррекция пересечения
        const overlap = (this.radius + ball.radius) - distance;
        const correction = overlap / 2;
        this.x -= correction * unitNormal.x;
        this.y -= correction * unitNormal.y;
        ball.x += correction * unitNormal.x;
        ball.y += correction * unitNormal.y;

        // Коррекция скорости в зависимости от упругости
        const elasticityFactor = 0.9; 
        this.dx *= Math.max(this.elasticity, elasticityFactor);
        this.dy *= Math.max(this.elasticity, elasticityFactor);
        ball.dx *= Math.max(ball.elasticity, elasticityFactor);
        ball.dy *= Math.max(ball.elasticity, elasticityFactor);
    }

    // Метод обработки столкновений вне фигуры
    handleOutsideShapeCollision(shape) {
        if (shape.intersects(this)) {
            for (let i = 0; i < shape.points.length; i++) {
                let start = shape.points[i];
                let end = shape.points[(i + 1) % shape.points.length];
                if (shape.lineIntersectsCircle(start[0], start[1], end[0], end[1], this.x, this.y, this.radius)) {
                    this.resolveShapeCollision(start, end, shape);
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
            }
        }
    }

    // Метод обработки столкновений внутри фигуры
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
            }
        }

        for (let i = 0; i < shape.points.length; i++) {
            let start = shape.points[i];
            let end = shape.points[(i + 1) % shape.points.length];
            if (shape.lineIntersectsCircle(start[0], start[1], end[0], end[1], this.x, this.y, this.radius)) {
                this.resolveShapeCollision(start, end, shape);
            }
        }
    }

    // Метод нахождения ближайшей точки фигуры к шарику
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

    // Метод нахождения ближайшей точки на отрезке до точки шарика
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

    // Метод разрешения столкновений с вершинами
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

            const velocityMagnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            if (velocityMagnitude > 10) {
                this.dx *= 0.5;
                this.dy *= 0.5;
            }
        }
    }

    // Метод разрешения столкновений с гранями фигур
    resolveShapeCollision(start, end, shape) {
        let normal = { x: end[1] - start[1], y: start[0] - end[0] };
        let length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= length;
        normal.y /= length;

        const dotProduct = this.dx * normal.x + this.dy * normal.y;
        this.dx -= 2 * dotProduct * normal.x;
        this.dy -= 2 * dotProduct * normal.y;

        const elasticityFactor = 0.9;
        this.dx *= Math.max(this.elasticity, elasticityFactor);
        this.dy *= Math.max(this.elasticity, elasticityFactor);

        const buffer = 2.0; 
        this.x += this.dx * buffer;
        this.y += this.dy * buffer;

        for (let i = 0; i < shape.points.length; i++) {
            this.resolveVertexCollision(shape.points[i]);
        }
    }

    renderInMenu(container) {
        const ballElement = document.createElement('div');
        ballElement.classList.add('ball-item');
        ballElement.style.width = `${this.radius * 2}px`;
        ballElement.style.height = `${this.radius * 2}px`;
        ballElement.style.backgroundColor = this.color;
        ballElement.style.borderRadius = '50%'; // Придание форме шара
        ballElement.style.position = 'relative'; // Позиционирование внутри контейнера
    
        container.appendChild(ballElement);
    }
    
}
