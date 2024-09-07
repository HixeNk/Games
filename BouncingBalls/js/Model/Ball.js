// Класс объекта шарика
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

    
    // Отрисовка шарика
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    // Обновление позиции шарика
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
    
    resolveShapeCollision(start, end, shape) {
        ShapeCollisionHandler.resolveCollision(this, start, end, shape);
    }

    // Ограничитель скорости для шарика
    limitSpeed() {
        const currentSpeed = Math.sqrt(this.dx ** 2 + this.dy ** 2);
        if (currentSpeed > this.maxSpeed) {
            const speedRatio = this.maxSpeed / currentSpeed;
            this.dx *= speedRatio;
            this.dy *= speedRatio;
        }
    }


    // Расчет будущего столкновения шарика и фигуры
    isCollidingWith(otherBall) {
        const dx = this.x - otherBall.x;
        const dy = this.y - otherBall.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + otherBall.radius);
    }

    // Определение границ, в пределах которых клик по объекту шарика будет распознан
    isClicked(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.radius;
    }

    // Отображение шарика в ballContainer
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