let isPaused = false;

class ControlPanel {
    constructor(balls) {
        this.balls = balls;
        this.shapes = [];
        this.speedSelect = document.getElementById('speed');
        this.elasticitySelect = document.getElementById('elasticity');
        this.pauseButton = document.getElementById('pause');
        this.playButton = document.getElementById('play');
        this.menu = document.getElementById('gameMenu');
        this.materialMenu = document.getElementById('materialMenu');
        this.addMaterialMenu = document.getElementById('addMaterialMenu');
        this.chooseMaterialButton = document.getElementById('material');
        this.backButton = document.getElementById('backToMainMenu');
        this.sizeRange = document.getElementById('sizeRange');
        this.sizeValue = document.getElementById('sizeValue');
        this.colorInput = document.getElementById('color');
        this.createBallButton = document.getElementById('createBall');
        this.addMaterialButton = document.getElementById('addMaterial');
        this.cancelMaterialButton = document.getElementById('cancelMaterial');
        this.saveMaterialButton = document.getElementById('saveMaterial');
        this.materialNameInput = document.getElementById('materialName');
        this.materialMassSelect = document.getElementById('materialMass');
        this.materialFrictionSelect = document.getElementById('materialFriction');
        this.materialTypeSelect = document.getElementById('materialType');
        this.ballContainer = document.getElementById('ballContainer');
        this.contextMenu = document.getElementById('contextMenu');
        this.contextColor = document.getElementById('contextColor');
        this.contextSizeRange = document.getElementById('contextSizeRange');
        this.contextSizeValue = document.getElementById('contextSizeValue');
        this.applyChangesButton = document.getElementById('applyChanges');
        this.closeMenuButton = document.getElementById('closeMenu');
        this.shapeMenu = document.getElementById('shapeMenu');
        this.shapeButton = document.getElementById('shapeButton');
        this.shapeInput = document.getElementById('shapeInput');
        this.drawShapeButton = document.getElementById('drawShape');
        this.closeShapeMenuButton = document.getElementById('closeShapeMenu');

        this.timeMultiplier = 1;
        this.isPaused = false;

        this.materialList = [{ name: 'Plastic', mass: 1 }];
        this.updateMaterialList();

        this.initEventListeners();
        this.initContextMenuHandlers();
        this.initBallClickHandler();
        this.initDragAndDrop();
        this.initShapes();

        const controlPanel = document.querySelector('.control-panel');
        this.setupDraggableElement(controlPanel);
        this.setupDraggableElement(this.menu);
        this.setupDraggableElement(this.materialMenu);
        this.setupDraggableElement(this.addMaterialMenu);
        this.setupDraggableElement(this.shapeMenu);


        this.setInitialPosition(controlPanel);
        this.updateValues();

        this.ballContainer.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });
    }

    initEventListeners() {
        this.speedSelect.addEventListener('change', () => this.updateValues());
        this.elasticitySelect.addEventListener('change', () => this.updateValues());
        this.pauseButton.addEventListener('click', () => this.pauseBalls());
        this.playButton.addEventListener('click', () => this.playBalls());
        this.createBallButton.addEventListener('click', () => this.createBall());
        this.chooseMaterialButton.addEventListener('click', () => this.showMaterialMenu());
        this.backButton.addEventListener('click', () => this.showMainMenu());
        this.addMaterialButton.addEventListener('click', () => this.showAddMaterialMenu());
        this.cancelMaterialButton.addEventListener('click', () => this.cancelAddMaterial());
        this.saveMaterialButton.addEventListener('click', () => this.saveNewMaterial());
        this.sizeRange.addEventListener('input', () => this.updateSizeDisplay());
        this.drawShapeButton.addEventListener('click', () => this.drawShape());
        this.closeShapeMenuButton.addEventListener('click', () => this.closeShapeMenu());
        this.shapeButton.addEventListener('click', () => this.showShapeMenu());

    }

    initContextMenuHandlers() {
        this.applyChangesButton.addEventListener('click', () => this.applyChanges());
        this.closeMenuButton.addEventListener('click', () => this.closeContextMenu());
        this.contextSizeRange.addEventListener('input', () => this.updateContextSizeDisplay());
    }

    initBallClickHandler() {
        document.getElementById('myCanvas').addEventListener('click', (event) => {
            const { offsetX, offsetY } = event;
            console.log('Левый клик по координатам:', offsetX, offsetY);
            let clickedBall = null;

            for (const ball of this.balls) {
                if (ball.isClicked(offsetX, offsetY)) {
                    console.log('Шарик выбран:', ball);
                    clickedBall = ball;
                    break;
                }
            }

            if (clickedBall) {
                this.selectedBall = clickedBall;
                console.log('Открытие контекстного меню для шарика:', clickedBall);
                this.openContextMenu(event.clientX, event.clientY, clickedBall);
            } else {
                console.log('Шарик не выбран');
            }
        });

        document.getElementById('myCanvas').addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Предотвращаем стандартное контекстное меню
            const { offsetX, offsetY } = event;
            console.log('Правый клик по координатам:', offsetX, offsetY);
            let clickedBall = null;

            for (const ball of this.balls) {
                if (ball.isClicked(offsetX, offsetY)) {
                    clickedBall = ball;
                    console.log('Шарик под курсором:', clickedBall);
                    break;
                }
            }

            if (clickedBall) {
                // Проверяем, действительно ли этот шарик в списке balls
                console.log('Шарики до удаления:', this.balls);
                this.balls = this.balls.filter(ball => ball.id !== clickedBall.id);
                console.log('Шарики после удаления:', this.balls);
                this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
                console.log('Шарик удалён:', clickedBall);
            } else {
                console.log('Шарик не найден для удаления');
            }
        });
    }

    initDragAndDrop() {
        let selectedBall = null;
        let offsetX, offsetY;
        let isDraggingNewBall = false;

        this.ballContainer.addEventListener('mousedown', (event) => {
            if (event.target.classList.contains('ball-item')) {
                selectedBall = event.target;
                const rect = selectedBall.getBoundingClientRect();
                offsetX = event.clientX - rect.left;
                offsetY = event.clientY - rect.top;
                selectedBall.style.cursor = 'grabbing';
                isDraggingNewBall = true;
                event.preventDefault();
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (selectedBall && isDraggingNewBall) {
                const x = event.clientX - offsetX;
                const y = event.clientY - offsetY;
                selectedBall.style.position = 'absolute';
                selectedBall.style.left = `${x}px`;
                selectedBall.style.top = `${y}px`;
                event.preventDefault();
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (selectedBall && isDraggingNewBall) {
                selectedBall.style.cursor = 'grab';
                const canvas = document.getElementById('myCanvas');
                const rect = canvas.getBoundingClientRect();
                const ballX = event.clientX - rect.left;
                const ballY = event.clientY - rect.top;

                const radius = parseFloat(selectedBall.style.width) / 2;
                const color = selectedBall.style.backgroundColor;

                const speedRange = 2;
                const dx = (Math.random() - 0.5) * speedRange;
                const dy = (Math.random() - 0.5) * speedRange;

                const newBall = new Ball(ballX, ballY, radius, dx, dy, color);
                newBall.elasticity = parseFloat(this.elasticitySelect.value);
                newBall.timeMultiplier = parseFloat(this.speedSelect.value);

                this.balls.push(newBall);
                selectedBall.remove();

                const ctx = canvas.getContext('2d');
                this.updateCanvas(ctx);

                isDraggingNewBall = false;
                selectedBall = null;
            }
        });
    }

    openContextMenu(x, y, ball) {
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.remove('hidden');

        this.contextColor.value = ball.color;
        this.contextSizeRange.value = ball.radius;
        this.contextSizeValue.textContent = ball.radius;
        this.selectedBall = ball;
    }

    closeContextMenu() {
        this.contextMenu.classList.add('hidden');
        this.selectedBall = null;
    }

    applyChanges() {
        if (this.selectedBall) {
            this.selectedBall.color = this.contextColor.value;
            this.selectedBall.radius = parseFloat(this.contextSizeRange.value);
            this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
        }
        this.closeContextMenu();
    }

    updateContextSizeDisplay() {
        this.contextSizeValue.textContent = this.contextSizeRange.value;
    }

    setInitialPosition(element) {
        element.style.left = `${window.innerWidth - element.offsetWidth - 10}px`;
        element.style.top = '10px';
    }

    setupDraggableElement(element) {
        let isDragging = false;
        let offsetX, offsetY;

        const onMouseDown = (event) => {
            // Проверяем, если клик происходит на input-элементах в shapeMenu, не начинаем перетаскивание
            if (event.target.tagName === 'INPUT' && element.id === 'shapeMenu') {
                return; // Выход из функции, не давая возможности начать перетаскивание
            }
            if (event.target.tagName === 'SELECT' || event.target.closest('select')) {
                return; // Выход из функции, не давая возможности начать перетаскивание
            }

            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
            element.style.cursor = 'grabbing';
            event.preventDefault();
        };

        const onMouseMove = (event) => {
            if (isDragging) {
                const x = event.clientX - offsetX;
                const y = event.clientY - offsetY;
                element.style.position = 'absolute';
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                event.preventDefault();
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            element.style.cursor = 'grab';
        };

        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    updateSizeDisplay() {
        this.sizeValue.textContent = this.sizeRange.value;
    }
    showShapeMenu() {
        this.shapeMenu.classList.remove('hidden');
    }

    closeShapeMenu() {
        this.shapeMenu.classList.add('hidden');
    }
    initShapes() {
        // Define initial shapes here
        this.shapes = [
            new CustomShape([[70, 70], [70, 650], [1450, 650], [1450, 70], [1000, 70], [1000, 300], [500, 300], [500, 70]], 'orange'),
            new CustomShape([[700, 350], [800, 350], [870, 420], [870, 520], [800, 590], [700, 590], [630, 520], [630, 420]], 'lime'),
            new CustomShape([[250, 120], [320, 170], [320, 250], [250, 300], [180, 250], [180, 170]], 'blue'),
            new CustomShape([[250, 400], [350, 400], [400, 470], [300, 570], [200, 470]], 'red'),
            new CustomShape([[1100, 150], [1300, 150], [1300, 330], [1100, 330]], 'black'),
            new CustomShape([[1150, 400], [1250, 550], [1050, 550]], 'purple')
        ];
    }
    drawShape() {
        const points = [];
        
        // Собираем координаты точек
        for (let i = 1; i <= 16; i += 2) {
            const x = parseFloat(document.getElementById(`shapeInput${i}`).value);
            const y = parseFloat(document.getElementById(`shapeInput${i+1}`).value);
    
            if (!isNaN(x) && !isNaN(y)) {
                points.push([x, y]);
            }
        }
    
        if (points.length >= 3) { // Минимум 3 точки для создания фигуры
            const color = document.getElementById('colorShape').value; // Получаем цвет из input
            const newShape = new CustomShape(points, color); // Передаём цвет в конструктор фигуры
    
            // Добавляем новую фигуру в список и перерисовываем канвас
            this.shapes.push(newShape);
            this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
    
            this.closeShapeMenu();
        } else {
            alert('Введите хотя бы 3 пары координат для создания фигуры.');
        }
    }
    
    
    updateValues() {
        const elasticity = parseFloat(this.elasticitySelect.value);
        const speed = parseFloat(this.speedSelect.value);
        this.timeMultiplier = speed;

        if (elasticity >= 1) {
            for (let ball of this.balls) {
                ball.elasticity = elasticity;
                ball.timeMultiplier = this.timeMultiplier;
                ball.dx = ball.dx;
                ball.dy = ball.dy;
            }
        } else {
            let dampingFactor = (speed / 10) * (1 - elasticity);
            dampingFactor = Math.max(0.1, Math.min(dampingFactor, 1.0));

            for (let ball of this.balls) {
                ball.elasticity = elasticity;
                ball.timeMultiplier = this.timeMultiplier;
                ball.dx *= dampingFactor;
                ball.dy *= dampingFactor;
            }
        }

        for (let ball1 of this.balls) {
            for (let ball2 of this.balls) {
                if (ball1 !== ball2 && ball1.isCollidingWith(ball2)) {
                    ball1.resolveBallCollision(ball2);
                }
            }
        }
    }

    pauseBalls() {
        this.isPaused = true;
        isPaused = true;
        this.pauseButton.style.display = 'none';
        this.playButton.style.display = 'block';
        this.menu.classList.remove('hidden');
    }

    playBalls() {
        this.isPaused = false;
        isPaused = false;
        this.pauseButton.style.display = 'block';
        this.playButton.style.display = 'none';
        this.menu.classList.add('hidden');
        draw();
    }

    createBall() {
        const radius = parseFloat(this.sizeRange.value);
        const color = this.colorInput.value;
        const material = this.materialList.find(mat => mat.name === this.materialTypeSelect.value) || { name: 'Plastic', mass: 1, friction: 0 };

        const newBall = new Ball(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight,
            radius,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            color,
            material
        );

        const ballContainer = document.getElementById('ballContainer');
        while (ballContainer.firstChild) {
            ballContainer.removeChild(ballContainer.firstChild);
        }

        newBall.renderInMenu(ballContainer);
        this.updateValues();
    }

    showMaterialMenu() {
        this.menu.classList.add('hidden');
        this.materialMenu.classList.remove('hidden');
    }

    showAddMaterialMenu() {
        this.menu.classList.add('hidden');
        this.addMaterialMenu.classList.remove('hidden');
    }

    cancelAddMaterial() {
        this.addMaterialMenu.classList.add('hidden');
        this.menu.classList.remove('hidden');
    }

    saveNewMaterial() {
        const name = this.materialNameInput.value;
        const mass = parseFloat(this.materialMassSelect.value);
        const friction = parseFloat(this.materialFrictionSelect.value); // Get friction value

        if (name) {
            const newMaterial = { name, mass, friction };
            this.materialList.push(newMaterial);
            this.updateMaterialList();
            this.showMaterialMenu();
        }
    }

    updateMaterialList() {
        this.materialTypeSelect.innerHTML = '';
        this.materialList.forEach(material => {
            const option = document.createElement('option');
            option.value = material.name;
            option.text = material.name;
            this.materialTypeSelect.appendChild(option);
        });
    }

    showMainMenu() {
        this.materialMenu.classList.add('hidden');
        this.addMaterialMenu.classList.add('hidden');
        this.menu.classList.remove('hidden');
    }

    updateCanvas(ctx) {
        const canvas = document.getElementById('myCanvas');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let ball of this.balls) {
            ball.draw(ctx);
        }
        for (let shape of this.shapes) { // Use this.shapes
            shape.draw(ctx);
        }
    }
    
}



