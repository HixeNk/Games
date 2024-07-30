// Класс для произвольных фигур
class CustomShape {
    constructor(points, color = 'blue') {
        this.points = points;
        this.color = color;
    }

    // Метод для отрисовки фигур
    draw(ctx) {
        if (this.points.length < 2) return;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.points[0][0], this.points[0][1]);

        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i][0], this.points[i][1]);
        }

        ctx.closePath();
        ctx.stroke();
    }

    // Метод проверки, содержит ли фигура заданный шарик
    contains(ball) {
        let collision = false;
        let next = 0;
        for (let current = 0; current < this.points.length; current++) {
            next = (current + 1) % this.points.length;
            let vc = this.points[current];
            let vn = this.points[next];

            if (((vc[1] > ball.y) !== (vn[1] > ball.y)) &&
                (ball.x < (vn[0] - vc[0]) * (ball.y - vc[1]) / (vn[1] - vc[1]) + vc[0])) {
                collision = !collision;
            }
        }
        return collision;
    }

     // Метод проверки пересечения линии с шариком
    lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
        let ac = { x: cx - x1, y: cy - y1 };
        let ab = { x: x2 - x1, y: y2 - y1 };
        let ab2 = ab.x * ab.x + ab.y * ab.y;
        let acab = ac.x * ab.x + ac.y * ab.y;
        let t = acab / ab2;
        t = (t < 0) ? 0 : (t > 1) ? 1 : t;
        let h = { x: ab.x * t + x1, y: ab.y * t + y1 };
        let h2 = (cx - h.x) * (cx - h.x) + (cy - h.y) * (cy - h.y);
        return h2 <= r * r;
    }

    // Метод проверки пересечения с шариком
    intersects(ball) {
        for (let i = 0; i < this.points.length; i++) {
            let start = this.points[i];
            let end = this.points[(i + 1) % this.points.length];
            if (this.lineIntersectsCircle(start[0], start[1], end[0], end[1], ball.x, ball.y, ball.radius)) {
                return true;
            }
        }
        return this.contains(ball);
    }

     // Метод расчета расстояния до точки
    distanceToPoint(x, y) {
        let minDistance = Infinity;
        for (let i = 0; i < this.points.length; i++) {
            let start = this.points[i];
            let end = this.points[(i + 1) % this.points.length];
            let distance = this.pointToLineSegmentDistance(start[0], start[1], end[0], end[1], x, y);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        return minDistance;
    }

    // Метод расчета расстояния от точки до отрезка
    pointToLineSegmentDistance(x1, y1, x2, y2, px, py) {
        let l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (l2 === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        let x = x1 + t * (x2 - x1);
        let y = y1 + t * (y2 - y1);
        return Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
    }
}