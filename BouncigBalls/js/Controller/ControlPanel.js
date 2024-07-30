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
        this.xInput = document.getElementById('X');
        this.yInput = document.getElementById('Y');
        this.timeMultiplier = 1;

        this.materialList = [{ name: 'Plastic', mass: 1 }];
        this.updateMaterialList();

        this.helpMenu = document.getElementById('helpMenu');
        this.helpButton = document.getElementById('helpButton');
        this.closeHelpButton = document.getElementById('closeHelpButton');

        this.speedSelect.addEventListener('change', this.updateValues.bind(this));
        this.elasticitySelect.addEventListener('change', this.updateValues.bind(this));
        this.pauseButton.addEventListener('click', this.pauseBalls.bind(this));
        this.playButton.addEventListener('click', this.playBalls.bind(this));
        this.createBallButton.addEventListener('click', this.createBall.bind(this));
        this.chooseMaterialButton.addEventListener('click', this.showMaterialMenu.bind(this));
        this.backButton.addEventListener('click', this.showMainMenu.bind(this));
        this.addMaterialButton.addEventListener('click', this.showAddMaterialMenu.bind(this));
        this.cancelMaterialButton.addEventListener('click', this.cancelAddMaterial.bind(this));
        this.saveMaterialButton.addEventListener('click', this.saveNewMaterial.bind(this));
        this.helpButton.addEventListener('click', this.showHelpMenu.bind(this));
        this.closeHelpButton.addEventListener('click', this.closeHelpMenu.bind(this));
        this.sizeRange.addEventListener('input', this.updateSizeDisplay.bind(this));

        const controlPanel = document.querySelector('.control-panel');
        this.setupDraggableElement(controlPanel);
        this.setupDraggableElement(this.menu);
        this.setupDraggableElement(this.materialMenu);
        this.setupDraggableElement(this.addMaterialMenu);
        this.setupDraggableElement(this.helpMenu);

        this.setInitialPosition(controlPanel);
        this.updateValues();
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
        isPaused = true;
        this.pauseButton.style.display = 'none';
        this.playButton.style.display = 'block';
        this.menu.classList.remove('hidden');
    }

    playBalls() {
        isPaused = false;
        this.pauseButton.style.display = 'block';
        this.playButton.style.display = 'none';
        this.menu.classList.add('hidden');
        if (typeof window.draw === 'function') {
            window.draw();
        }
    }

    createBall() {
        const x = parseFloat(this.xInput.value) || Math.random() * 500;
        const y = parseFloat(this.yInput.value) || Math.random() * 500;
        const radius = parseFloat(this.sizeRange.value);
        const color = this.colorInput.value;
        const material = this.materialList[this.materialTypeSelect.selectedIndex];

        const speed = parseFloat(this.speedSelect.value);
        const angle = Math.random() * 2 * Math.PI;
        const dx = speed * Math.cos(angle);
        const dy = speed * Math.sin(angle);

        const ball = new Ball(x, y, radius, dx, dy, color, material);

        this.balls.push(ball);
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
        this.helpMenu.classList.add('hidden');
        this.menu.classList.remove('hidden');
    }

    showHelpMenu() {
        this.menu.classList.add('hidden');
        this.helpMenu.classList.remove('hidden');
    }

    closeHelpMenu() {
        this.helpMenu.classList.add('hidden');
        this.menu.classList.remove('hidden');
    }
}
