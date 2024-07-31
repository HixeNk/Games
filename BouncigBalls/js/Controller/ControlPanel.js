let isPaused = false;

class ControlPanel {
    constructor(balls) {
        this.balls = balls;
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
        this.materialTypeSelect = document.getElementById('materialType');
        this.timeMultiplier = 1;
        this.isPaused = false; // Локальное состояние для управления паузой

        this.materialList = [{ name: 'Plastic', mass: 1 }];
        this.updateMaterialList();

        this.initEventListeners();

        this.ballContainer = document.getElementById('ballContainer');
        this.initDragAndDrop();

        const controlPanel = document.querySelector('.control-panel');
        this.setupDraggableElement(controlPanel);
        this.setupDraggableElement(this.menu);
        this.setupDraggableElement(this.materialMenu);
        this.setupDraggableElement(this.addMaterialMenu);

        this.setInitialPosition(controlPanel);
        this.updateValues();

        // Setup the ballContainer to ignore drag events
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
    }

    setInitialPosition(element) {
        element.style.left = `${window.innerWidth - element.offsetWidth - 10}px`;
        element.style.top = '10px';
    }

    setupDraggableElement(element) {
        let dragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (event) => {
            if (event.target.tagName !== 'SELECT' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'BUTTON') {
                dragging = true;
                offsetX = event.clientX - element.getBoundingClientRect().left;
                offsetY = event.clientY - element.getBoundingClientRect().top;
                event.preventDefault();
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (dragging) {
                element.style.left = `${event.clientX - offsetX}px`;
                element.style.top = `${event.clientY - offsetY}px`;
                event.preventDefault();
            }
        });

        document.addEventListener('mouseup', () => {
            dragging = false;
        });
    }

    updateSizeDisplay() {
        this.sizeValue.textContent = this.sizeRange.value;
    }

    updateValues() {
        const elasticity = parseFloat(this.elasticitySelect.value);
        const speed = parseFloat(this.speedSelect.value);
        this.timeMultiplier = speed;

        for (let ball of this.balls) {
            ball.elasticity = elasticity;
            ball.timeMultiplier = this.timeMultiplier;

            const dampingFactorLow = 0.98;
            const dampingFactorHigh = 0.85;

            if (elasticity < 0.8 && speed < 3) {
                ball.dx *= dampingFactorLow;
                ball.dy *= dampingFactorLow;
            }

            if (speed >= 3 && elasticity < 0.8) {
                ball.dx *= dampingFactorHigh;
                ball.dy *= dampingFactorHigh;
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
        this.pauseButton.style.display = 'none';
        this.playButton.style.display = 'block';
        this.menu.classList.remove('hidden');
    }

    playBalls() {
        this.isPaused = false;
        this.pauseButton.style.display = 'block';
        this.playButton.style.display = 'none';
        this.menu.classList.add('hidden');
        if (typeof window.draw === 'function') {
            window.draw();
        }
    }

    createBall() {
        const radius = parseFloat(this.sizeRange.value);
        const color = this.colorInput.value;
        const material = this.materialList.find(mat => mat.name === this.materialTypeSelect.value) || {name: 'Plastic', mass: 1};
        
        // Создание нового шарика
        const newBall = new Ball(
            Math.random() * window.innerWidth, // Начальная позиция X
            Math.random() * window.innerHeight, // Начальная позиция Y
            radius,
            (Math.random() - 0.5) * 2, // Начальная скорость по X
            (Math.random() - 0.5) * 2, // Начальная скорость по Y
            color,
            material
        );
    
        // Получение контейнера
        const ballContainer = document.getElementById('ballContainer');
    
        // Удаление старого шарика, если он существует
        while (ballContainer.firstChild) {
            ballContainer.removeChild(ballContainer.firstChild);
        }
    
        // Отображение нового шарика в меню
        newBall.renderInMenu(ballContainer);
    
        // Обновление значений
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

        if (name && !isNaN(mass)) {
            const newMaterial = { name, mass };
            this.materialList.push(newMaterial);
            this.updateMaterialList();
            this.showMainMenu();
        } else {
            alert("Please enter valid material name and mass.");
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

    initDragAndDrop() {
        let selectedBall = null;
        let offsetX, offsetY;

        // Обработчик нажатия мыши на шарик
        this.ballContainer.addEventListener('mousedown', (event) => {
            if (event.target.classList.contains('ball-item')) {
                selectedBall = event.target;
                const rect = selectedBall.getBoundingClientRect();
                offsetX = event.clientX - rect.left;
                offsetY = event.clientY - rect.top;
                selectedBall.style.cursor = 'grabbing';
                event.preventDefault();
            }
        });

        // Обработчик движения мыши
        document.addEventListener('mousemove', (event) => {
            if (selectedBall) {
                const x = event.clientX - offsetX;
                const y = event.clientY - offsetY;
                selectedBall.style.position = 'absolute'; // Убедитесь, что элемент имеет абсолютное позиционирование
                selectedBall.style.left = `${x}px`;
                selectedBall.style.top = `${y}px`;
                event.preventDefault();
            }
        });

        // Обработчик отпускания мыши
        document.addEventListener('mouseup', (event) => {
            if (selectedBall) {
                selectedBall.style.cursor = 'grab';
                const canvas = document.getElementById('myCanvas');
                const rect = canvas.getBoundingClientRect();
                const ballX = event.clientX - rect.left;
                const ballY = event.clientY - rect.top;

                // Преобразование размеров и цвета для создания шарика на канвасе
                const radius = parseFloat(selectedBall.style.width) / 2;
                const color = selectedBall.style.backgroundColor;
                const newBall = new Ball(ballX, ballY, radius, 0, 0, color);
                
                // Добавление нового шарика на канвас и в массив шариков
                this.balls.push(newBall);
                selectedBall.remove(); // Удаление шарика из контейнера

                // Обновление экрана
                const ctx = canvas.getContext('2d');
                this.updateCanvas(ctx);
                
                selectedBall = null;
            }
        });
    }

    updateCanvas(ctx) {
        // Очистка канваса
        const canvas = document.getElementById('myCanvas');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let ball of this.balls) {
            ball.draw(ctx);
        }
    }
}
