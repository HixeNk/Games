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

        this.initShapes();
    }

    // Стандартные фигуры shapes
    initShapes() {
        this.shapes = [
            new CustomShape([[70, 70], [70, 650], [1450, 650], [1450, 70], [1000, 70], [1000, 300], [500, 300], [500, 70]], 'orange'),
            new CustomShape([[700, 350], [800, 350], [870, 420], [870, 520], [800, 590], [700, 590], [630, 520], [630, 420]], 'lime'),
            new CustomShape([[250, 120], [320, 170], [320, 250], [250, 300], [180, 250], [180, 170]], 'blue'),
            new CustomShape([[250, 400], [350, 400], [400, 470], [300, 570], [200, 470]], 'red'),
            new CustomShape([[1100, 150], [1300, 150], [1300, 330], [1100, 330]], 'black'),
            new CustomShape([[1150, 400], [1250, 550], [1050, 550]], 'purple')
        ];
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

            // Вызов обновления холста сразу после добавления фигуры
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
