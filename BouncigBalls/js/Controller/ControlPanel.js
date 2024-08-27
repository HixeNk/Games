

let isPaused = false;
// Класс панелей
class ControlPanel {
    constructor(balls) {
        this.balls = balls;
        this.shapes = [];
        this.timeMultiplier = 1;
        this.isPaused = false;
        this.materialList = [];
        this.isDraggingMenu = false; 
        this.isDraggingBall = false;
        this.bamTexts = [];
        this.selectedBall = null;
        this.initElements();
        this.initEventListeners();
        this.initContextMenuHandlers();
        this.initBallClickHandler();
        this.initDragAndDrop();
        this.initShapes();
        this.setupDraggableElements();

        this.updateMaterialList();
        this.updateValues();

        const controlPanel = document.querySelector('.control-panel');
        this.setupDraggableElement(controlPanel);
        this.setInitialPosition(controlPanel);
       
    }

    initElements() {
        this.speedSlider = new SliderButton('speed', () => this.updateValues());
        this.elasticitySlider = new SliderButton('elasticity', () => this.updateValues());
        this.toggleButton = new ToggleButton('play', 'pause', () => this.playBalls(), () => this.pauseBalls());
        this.menu = document.getElementById('gameMenu');
        this.materialMenu = document.getElementById('materialMenu');
        this.addMaterialMenu = document.getElementById('addMaterialMenu');
        this.chooseMaterialButton = new Button('material', () => this.showMaterialMenu());
        this.backButton = new Button('backToMainMenu', () => this.showMainMenu());
        this.sizeSlider = new SliderButton('sizeRange', () => this.updateSizeDisplay());
        this.colorInput = document.getElementById('color');
        this.createBallButton = new Button('createBall', () => this.createBall());
        this.addMaterialButton = new Button('addMaterial', () => this.showAddMaterialMenu());
        this.cancelMaterialButton = new Button('cancelMaterial', () => this.cancelAddMaterial());
        this.saveMaterialButton = new Button('saveMaterial', () => this.saveNewMaterial());
        this.materialNameInput = document.getElementById('materialName');
        this.materialMassSelect = document.getElementById('materialMass');
        this.materialTypeSelect = document.getElementById('materialType');
        this.ballContainer = document.getElementById('ballContainer');
        this.contextMenu = document.getElementById('contextMenu');
        this.contextColor = document.getElementById('contextColor');
        this.contextSizeRange = new SliderButton('contextSizeRange', () => this.updateContextSizeDisplay());
        this.contextSizeValue = document.getElementById('contextSizeValue');
        this.applyChangesButton = new Button('applyChanges', () => this.applyChanges());
        this.closeMenuButton = new Button('closeMenu', () => this.closeContextMenu());
        this.shapeMenu = document.getElementById('shapeMenu');
        this.shapeButton = new Button('shapeButton', () => this.showShapeMenu());
        this.shapeInput = document.getElementById('shapeInput');
        this.drawShapeButton = new Button('drawShape', () => this.drawShape());
        this.closeShapeMenuButton = new Button('closeShapeMenu', () => this.closeShapeMenu());
        this.startEventButton = document.getElementById('StartEvent');
        this.startEventButton= new Button('StartEvent', () => this.startEvent());
        this.endEventButton = document.getElementById('EndEvent');
        this.endEventButton= new Button('EndEvent', () => this.endEvent());
    }

    initEventListeners() {
            this.sizeSlider.getValue = () => parseFloat(this.sizeSlider.slider.value);
    }


    initContextMenuHandlers() {
        const deleteButton = document.getElementById('deleteBall');
            deleteButton.addEventListener('click', () => this.deleteSelectedBall());
    }
    // Распознование шарика, по которому будет вызываться ContextMenu
    initBallClickHandler() {
        const canvas = document.getElementById('myCanvas');
            canvas.addEventListener('click', (event) => {
                const { offsetX, offsetY } = event;
                let clickedBall = null;

                for (const ball of this.balls) {
                    if (ball.isClicked(offsetX, offsetY)) {
                        clickedBall = ball;
                        break;
                    }
                }
                if (clickedBall) {
                    this.selectedBall = clickedBall;
                    this.openContextMenu(event.clientX, event.clientY, clickedBall);
                }
            });
    }

    // Перетаскивание шарика
    initDragAndDrop() {
        let selectedBall = null;
        let offsetX, offsetY;
            this.ballContainer.addEventListener('mousedown', (event) => {
                if (event.target.classList.contains('ball-item')) {
                    selectedBall = event.target;
                    const rect = selectedBall.getBoundingClientRect();
                    offsetX = event.clientX - rect.left;
                    offsetY = event.clientY - rect.top;
                    selectedBall.style.cursor = 'grabbing';
                    this.isDraggingBall = true; 
                    event.preventDefault();
                }
            });
    
            document.addEventListener('mousemove', (event) => {
                if (selectedBall && this.isDraggingBall) {
                    const menuRect = this.menu.getBoundingClientRect();
                    const x = event.clientX - offsetX - menuRect.left;
                    const y = event.clientY - offsetY - menuRect.top;
                    selectedBall.style.position = 'absolute';
                    selectedBall.style.left = `${x}px`;
                    selectedBall.style.top = `${y}px`;
                    event.preventDefault();
                }
            });
    
            document.addEventListener('mouseup', (event) => {
                if (selectedBall && this.isDraggingBall) {
                    this.isDraggingBall = false; 
                    selectedBall.style.cursor = 'grab';
    
                    const canvas = document.getElementById('myCanvas');
                   
                        const rect = canvas.getBoundingClientRect();
                        const ballX = event.clientX - rect.left - offsetX;
                        const ballY = event.clientY - rect.top - offsetY;
                        const radius = parseFloat(selectedBall.style.width) / 2;
                        const color = selectedBall.style.backgroundColor;
    
                        const speedRange = 2;
                        const dx = (Math.random() - 0.5) * speedRange;
                        const dy = (Math.random() - 0.5) * speedRange;
    
                        const newBall = new Ball(ballX, ballY, radius, dx, dy, color);
                        newBall.elasticity = parseFloat(this.elasticitySlider.getValue());
                        newBall.timeMultiplier = parseFloat(this.speedSlider.getValue());
    
                        this.balls.push(newBall);
                        selectedBall.remove();
    
                        const ctx = canvas.getContext('2d');
                        this.updateCanvas(ctx);
                 
                    selectedBall = null;
                }
            });
     
    }
    
    // Кнопка начала события шарика
    startEvent() {
        if (this.selectedBall) {
        this.selectedBall.onCollision = (x, y) => {
            this.drawBamText(x, y);
        };}  
    }

    // Кнопка завершения события шарика
    endEvent() {
         if (this.selectedBall) {
             this.selectedBall.onCollision = null; 
         }
    }
    // Отображение текста BAM на канвасе
    drawBamText(x, y) {
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
    
        ctx.font = '20px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('BAM', x, y);
        const bamText = {
            x: x,
            y: y,
            width: ctx.measureText('BAM').width,
            height: 24,
            startTime: Date.now(),  
        };
        this.bamTexts.push(bamText);
    }
    
    // Открытие контекстного меню
    openContextMenu(x, y, ball) {
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.remove('hidden');

        this.contextColor.value = ball.color;
        this.contextSizeRange.slider.value = ball.radius;
        this.updateContextSizeDisplay();
        this.selectedBall = ball; 
    }

    // Закрытие контекстного меню
    closeContextMenu() {
        this.contextMenu.classList.add('hidden');
        this.selectedBall = null; 
    }

    // Подтверждение изменения параметров шарика в контектсном меню
    applyChanges() {
        if (this.selectedBall) {
            this.selectedBall.color = this.contextColor.value;
            this.selectedBall.radius = parseFloat(this.contextSizeRange.getValue());
            this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
        }
        this.closeContextMenu();
    }

    // Удаление шарика в контекстном меню
    deleteSelectedBall() {
        if (this.selectedBall) {
            this.balls = this.balls.filter(ball => ball !== this.selectedBall);
            this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
            this.closeContextMenu();
        }
    }

    // Изменение размеров шарика в контекстном меню
    updateContextSizeDisplay() {
            this.contextSizeValue.textContent = this.contextSizeRange.getValue();
    }
    // Установка изначальной позиции для панелей gameMenu
    setInitialPosition(element) {
            element.style.position = 'absolute';
            element.style.left = `${window.innerWidth - element.offsetWidth}px`;  
            element.style.top = '0px'; 
    }
    
    // Установка перетаскиваемых панелей
    setupDraggableElements() {
        const elements = [
            this.menu,
            this.materialMenu,
            this.addMaterialMenu,
            this.shapeMenu
        ];
        elements.forEach(element => this.setupDraggableElement(element));
    }
    
    // Перетаскивание панелей
    setupDraggableElement(element) {
        let offsetX, offsetY;
        let isDragging = false;
    
        element.addEventListener('mousedown', (event) => {
            if (event.target.classList.contains('ball-item')) {
                return;
            }
    
            const isInteractiveElement = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName);
    
            if (isInteractiveElement) {
                return; 
            }
    
            const rect = element.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
            isDragging = true;
            element.style.cursor = 'grabbing'; 
            element.classList.add('dragging'); 
            element.style.opacity = '0.5';
    
            event.preventDefault();
        });
    
        document.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const x = event.clientX - offsetX;
                const y = event.clientY - offsetY;
    
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                event.preventDefault();
            }
        });
    
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'grab';
                element.classList.remove('dragging');
                element.style.opacity = '1';
            }
        });
    }
    // Ползунок размеров шарика
    updateSizeDisplay() {
        const sizeValue = document.getElementById('sizeValue');
            sizeValue.textContent = this.sizeSlider.getValue();
    }
    
    // Открытие панели фигур
    showShapeMenu() {
            this.shapeMenu.classList.remove('hidden');
    }

    // Закрытие панели фигур
    closeShapeMenu() {
            this.shapeMenu.classList.add('hidden');
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

    // Отрисовака новых фигур по координатам
    drawShape() {
        const points = [];

        for (let i = 1; i <= 16; i += 2) {
            const x = parseFloat(document.getElementById(`shapeInput${i}`).value);
            const y = parseFloat(document.getElementById(`shapeInput${i+1}`).value);

            if (!isNaN(x) && !isNaN(y)) {
                points.push([x, y]);
            }
        }

        if (points.length >= 2) {
            const color = document.getElementById('colorShape').value;
            const newShape = new CustomShape(points, color);

            this.shapes.push(newShape);
            this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));

            this.closeShapeMenu();
        } else {
            alert('Введите хотя бы 2 пары координат для создания фигуры.');
        }
    }

// Обновление значений в панели управления
updateValues() {
    const elasticity = parseFloat(this.elasticitySlider.getValue());
    let speed = parseFloat(this.speedSlider.getValue());

    const maxSpeed = 2; 
    const speedLimit = Math.min(speed, maxSpeed); 

    this.timeMultiplier = speed;

    for (let ball of this.balls) {
        ball.elasticity = elasticity;
        ball.timeMultiplier = this.timeMultiplier;

        if (elasticity >= 1) {
            const scaleFactor = speedLimit / 10;
            ball.dx = (ball.dx / Math.max(Math.abs(ball.dx), 0.1)) * scaleFactor;
            ball.dy = (ball.dy / Math.max(Math.abs(ball.dy), 0.1)) * scaleFactor;
        } else {
            let dampingFactor = (speedLimit / 10) * (1 - elasticity);
            dampingFactor = Math.max(0.1, Math.min(dampingFactor, 1.0));
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

    // Кнопка паузе
    pauseBalls() {
        this.isPaused = true;
        this.toggleButton.showPlayButton();
        this.menu.classList.remove('hidden');
    }
    
    // Кнопка воспроизведения
    playBalls() {
        this.isPaused = false;
        this.toggleButton.showPauseButton();
        this.menu.classList.add('hidden');
        draw();
    }
    
    // Создание шарика с его параметрами на панели
    createBall() {
        const radius = this.sizeSlider.getValue();
        const color = this.colorInput.value;
        const material = this.selectedMaterial || { name: 'Plastic', mass: 1 };

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

    // Открытие меню материалов
    showMaterialMenu() {
            this.menu.classList.add('hidden');
            this.materialMenu.classList.remove('hidden');
            this.selectedMaterial = this.materialList.find(mat => mat.name === this.materialTypeSelect.value) || { name: 'Plastic', mass: 1 };
    }

    // Открытия меню создания новых материалов
    showAddMaterialMenu() {
            this.menu.classList.add('hidden');
            this.addMaterialMenu.classList.remove('hidden');
    }
    
    // Закрытие меню создания материалов
    cancelAddMaterial() {
            this.addMaterialMenu.classList.add('hidden');
            this.menu.classList.remove('hidden');
    }

    // Сохранение нового материала
    saveNewMaterial() {
        const materialName = this.materialNameInput.value.trim();
        const materialMass = parseFloat(this.materialMassSelect.value);

        if (materialName !== '') {
            const newMaterial = { name: materialName, mass: materialMass };
            this.materialList.push(newMaterial);
            this.updateMaterialList();
            this.selectedMaterial = newMaterial;
        }

        this.showMainMenu();
    }

    // Обновление списка материалов
    updateMaterialList() {
            this.materialTypeSelect.innerHTML = '';
            this.materialList.forEach(material => {
                const option = document.createElement('option');
                option.value = material.name;
                option.textContent = material.name;
                this.materialTypeSelect.appendChild(option);
            });
    
            if (!this.selectedMaterial && this.materialList.length > 0) {
                this.selectedMaterial = this.materialList[0];
                this.materialTypeSelect.value = this.selectedMaterial.name;
            }
    }
    
    // Отобржаение основного меню gameMenu
    showMainMenu() {
            this.materialMenu.classList.add('hidden');
            this.addMaterialMenu.classList.add('hidden');
            this.menu.classList.remove('hidden');
    }

    // Настройка текста BAM
    updateBamTexts(ctx) {
        const currentTime = Date.now();
        this.bamTexts = this.bamTexts.filter(bamText => {
            const elapsedTime = currentTime - bamText.startTime;
            
            if (elapsedTime > 2000) {
                ctx.clearRect(bamText.x, bamText.y - bamText.height, bamText.width, bamText.height);
                return false;
            } else {
                ctx.font = '20px Arial';
                ctx.fillStyle = 'red';
                ctx.fillText('BAM', bamText.x, bamText.y);
                return true; 
            }
        });
    }
    
    // Обновление канваса
    updateCanvas(ctx) {
        const canvas = document.getElementById('myCanvas');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let ball of this.balls) {
            ball.draw(ctx);
            }
            for (let shape of this.shapes) {
            shape.draw(ctx);
            }
            this.updateBamTexts(ctx);
    }
    
}
