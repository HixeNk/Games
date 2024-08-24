let isPaused = false;

class ControlPanel {
    constructor(balls) {
        this.balls = balls;
        this.shapes = [];
        this.timeMultiplier = 1;
        this.isPaused = false;
        this.materialList = [];
        this.isDraggingMenu = false; // Отслеживание перетаскивания меню
        this.isDraggingBall = false; // Отслеживание перетаскивания шарика
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
        if (controlPanel) {
            this.setupDraggableElement(controlPanel);
            this.setInitialPosition(controlPanel);
        } else {
            console.error('Control panel element not found.');
        }
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
    }

    initEventListeners() {
        // Ensure the size slider's getValue method is set up correctly
        if (this.sizeSlider) {
            this.sizeSlider.getValue = () => parseFloat(this.sizeSlider.slider.value);
        } else {
            console.error('Size slider not initialized.');
        }
    }


    initContextMenuHandlers() {
        const deleteButton = document.getElementById('deleteBall');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.deleteSelectedBall());
        } else {
            console.error('Delete button not found.');
        }
    }

    initBallClickHandler() {
        const canvas = document.getElementById('myCanvas');
        if (canvas) {
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
        } else {
            console.error('Canvas element not found.');
        }

    }

    initDragAndDrop() {
        let selectedBall = null;
        let offsetX, offsetY;

        if (this.ballContainer) {
            this.ballContainer.addEventListener('mousedown', (event) => {
                if (event.target.classList.contains('ball-item')) {
                    selectedBall = event.target;
                    const rect = selectedBall.getBoundingClientRect();
                    offsetX = event.clientX - rect.left;
                    offsetY = event.clientY - rect.top;
                    selectedBall.style.cursor = 'grabbing';
                    this.isDraggingBall = true; // Начинаем перетаскивание шарика
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
                    this.isDraggingBall = false; // Заканчиваем перетаскивание шарика
                    selectedBall.style.cursor = 'grab';
    
                    const canvas = document.getElementById('myCanvas');
                    if (canvas) {
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
                    } else {
                        console.error('Canvas element not found.');
                    }
                    selectedBall = null;
                }
            });
        } else {
            console.error('Ball container not found.');
        }
    }
    openContextMenu(x, y, ball) {
        if (this.contextMenu) {
            this.contextMenu.style.left = `${x}px`;
            this.contextMenu.style.top = `${y}px`;
            this.contextMenu.classList.remove('hidden');

            this.contextColor.value = ball.color;
            this.contextSizeRange.slider.value = ball.radius;
            this.updateContextSizeDisplay();
            this.selectedBall = ball;
        } else {
            console.error('Context menu not found.');
        }
    }

    closeContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.classList.add('hidden');
            this.selectedBall = null;
        } else {
            console.error('Context menu not found.');
        }
    }

    applyChanges() {
        if (this.selectedBall) {
            this.selectedBall.color = this.contextColor.value;
            this.selectedBall.radius = parseFloat(this.contextSizeRange.getValue());
            this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
        }
        this.closeContextMenu();
    }

    deleteSelectedBall() {
        if (this.selectedBall) {
            this.balls = this.balls.filter(ball => ball !== this.selectedBall);
            this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
            this.closeContextMenu();
        }
    }


    updateContextSizeDisplay() {
        if (this.contextSizeValue) {
            this.contextSizeValue.textContent = this.contextSizeRange.getValue();
        } else {
            console.error('Context size value element not found.');
        }
    }

    setInitialPosition(element) {
        if (element) {
            element.style.position = 'absolute';
            element.style.left = `${window.innerWidth - element.offsetWidth}px`;  // Устанавливаем начальное положение по горизонтали
            element.style.top = '0px';  // Устанавливаем начальное положение по вертикали
        } else {
            console.error('Element for initial position not found.');
        }
    }
    
    
    setupDraggableElements() {
        const elements = [
            this.menu,
            this.materialMenu,
            this.addMaterialMenu,
            this.shapeMenu
        ];
        elements.forEach(element => this.setupDraggableElement(element));
    }
    
    setupDraggableElement(element) {
        if (!element) {
            console.error('Element not found for dragging.');
            return;
        }
    
        let offsetX, offsetY;
        let isDragging = false;
    
        element.addEventListener('mousedown', (event) => {
            // Если клик произошел по шарику, не начинаем перетаскивание панели
            if (event.target.classList.contains('ball-item')) {
                return;
            }
    
            const isInteractiveElement = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName);
    
            if (isInteractiveElement) {
                return; // Прерываем перетаскивание, если кликнули по интерактивному элементу
            }
    
            const rect = element.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
            isDragging = true;
            element.style.cursor = 'grabbing'; // Устанавливаем курсор на grabbing
            element.classList.add('dragging'); 
    
            // Устанавливаем полупрозрачность при начале перетаскивания
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
                element.style.cursor = 'grab'; // Возвращаем курсор на grab
                element.classList.remove('dragging');
    
                // Восстанавливаем непрозрачность после завершения перетаскивания
                element.style.opacity = '1';
            }
        });
    }
    
    
    
    updateSizeDisplay() {
        const sizeValue = document.getElementById('sizeValue');
        if (sizeValue) {
            sizeValue.textContent = this.sizeSlider.getValue();
        } else {
            console.error('Size value element not found.');
        }
    }

    showShapeMenu() {
        if (this.shapeMenu) {
            this.shapeMenu.classList.remove('hidden');
        } else {
            console.error('Shape menu not found.');
        }
    }

    closeShapeMenu() {
        if (this.shapeMenu) {
            this.shapeMenu.classList.add('hidden');
        } else {
            console.error('Shape menu not found.');
        }
    }

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

    updateValues() {
        const elasticity = parseFloat(this.elasticitySlider.getValue());
        const speed = parseFloat(this.speedSlider.getValue());
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
        this.toggleButton.showPlayButton();
        this.menu.classList.remove('hidden');
    }
    
    playBalls() {
        this.isPaused = false;
        this.toggleButton.showPauseButton();
        this.menu.classList.add('hidden');
        draw();
    }
    

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
        if (ballContainer) {
            while (ballContainer.firstChild) {
                ballContainer.removeChild(ballContainer.firstChild);
            }

            newBall.renderInMenu(ballContainer);
            this.updateValues();
        } else {
            console.error('Ball container not found.');
        }
    }

    showMaterialMenu() {
        if (this.menu && this.materialMenu) {
            this.menu.classList.add('hidden');
            this.materialMenu.classList.remove('hidden');
            this.selectedMaterial = this.materialList.find(mat => mat.name === this.materialTypeSelect.value) || { name: 'Plastic', mass: 1 };
        } else {
            console.error('Menu or material menu not found.');
        }
    }

    showAddMaterialMenu() {
        if (this.menu && this.addMaterialMenu) {
            this.menu.classList.add('hidden');
            this.addMaterialMenu.classList.remove('hidden');
        
        } else {
            console.error('Menu or add material menu not found.');
        }
    }
    

    cancelAddMaterial() {
        if (this.addMaterialMenu && this.menu) {
            this.addMaterialMenu.classList.add('hidden');
            this.menu.classList.remove('hidden');
        } else {
            console.error('Add material menu or main menu not found.');
        }
    }

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

    updateMaterialList() {
        if (this.materialTypeSelect && Array.isArray(this.materialList)) {
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
        } else {
            console.error('Material type select element or material list not found.');
        }
    }
    

    showMainMenu() {
        if (this.menu && this.materialMenu && this.addMaterialMenu) {
            this.materialMenu.classList.add('hidden');
            this.addMaterialMenu.classList.add('hidden');
            this.menu.classList.remove('hidden');
        } else {
            console.error('Main menu or other menu elements not found.');
        }
    }

    updateCanvas(ctx) {
        if (ctx) {
            const canvas = document.getElementById('myCanvas');
            if (canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let ball of this.balls) {
                    ball.draw(ctx);
                }
                for (let shape of this.shapes) {
                    shape.draw(ctx);
                }
            } else {
                console.error('Canvas element not found.');
            }
        } else {
            console.error('Canvas context not found.');
        }
    }
}
