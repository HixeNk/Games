// Класс управления меню фигур
class ShapeMenu {
    constructor(updateCanvasCallback) {
        this.shapeMenu = document.getElementById('shapeMenu');
        this.shapeButton = new Button('shapeButton', () => this.showShapeMenu());
        this.shapeInput = document.getElementById('shapeInput');
        this.drawShapeButton = new Button('drawShape', () => this.drawShape());
        this.closeShapeMenuButton = new Button('closeShapeMenu', () => this.closeShapeMenu());
        this.shapes = [];
        this.updateCanvasCallback = updateCanvasCallback;
    }

    // Открытие панели фигур
    showShapeMenu() {
        this.shapeMenu.classList.remove('hidden');
    }

    // Закрытие панели фигур
    closeShapeMenu() {
        this.shapeMenu.classList.add('hidden');
    }

    // Отрисовка новых фигур по координатам
    drawShape() {
        const points = [];
        for (let i = 1; i <= 16; i += 2) {
            const x = parseFloat(document.getElementById(`shapeInput${i}`).value);
            const y = parseFloat(document.getElementById(`shapeInput${i + 1}`).value);
            if (!isNaN(x) && !isNaN(y)) {
                points.push([x, y]);
            }
        }
        if (points.length >= 3) {
            const color = document.getElementById('colorShape').value;
            const newShape = new CustomShape(points, color);
            this.shapes.push(newShape);

            this.updateCanvasCallback();

            this.closeShapeMenu();
        } else {
            alert('Введите хотя бы 3 пары координат для создания фигуры.');
        }
    }

    // Метод для отрисовки всех фигур на канвасе
    drawShapes(ctx) {
        for (let shape of this.shapes) {
            shape.draw(ctx);
        }
    }
}