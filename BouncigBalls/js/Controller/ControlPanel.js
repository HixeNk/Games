let isPaused = false;

class ControlPanel {
    constructor(balls) {
        this.balls = balls;
        this.timeMultiplier = 1;
        this.isPaused = false;
        this.materialList = [];
        this.shapes = [];
        this.isDraggingMenu = false; 
        this.isDraggingBall = false;
        this.selectedBall = null;

        this.initElements();
        this.initEventListeners();
        this.initContextMenuHandlers();
        this.initBallClickHandler();
        this.initDragAndDrop();
        this.setupDraggableElements();

        this.updateValues();

        const controlPanel = document.querySelector('.control-panel');
        this.setupDraggableElement(controlPanel);
        this.setInitialPosition(controlPanel);

        this.contextMenu = new ContextMenu(this.balls, (ctx) => this.updateCanvas(ctx));
        this.contextMenu.setCallbacks(
            (ctx) => this.updateCanvas(ctx),
            (ball) => this.deleteBall(ball)
        );
       
        this.shapeMenu = new ShapeMenu(() => this.updateCanvas(document.getElementById('myCanvas').getContext('2d')));
        this.materialMenu = new MaterialMenu(this);
    }

    initElements() {
        this.speedSlider = new SliderButton('speed', () => this.updateValues());
        this.elasticitySlider = new SliderButton('elasticity', () => this.updateValues());
        this.toggleButton = new ToggleButton('play', 'pause', () => this.playBalls(), () => this.pauseBalls());
        this.menu = document.getElementById('gameMenu');
        this.sizeSlider = new SliderButton('sizeRange', () => this.updateSizeDisplay());
        this.colorInput = document.getElementById('color');
        this.createBallButton = new Button('createBall', () => this.createBall());
        this.ballContainer = document.getElementById('ballContainer');
        this.shapeMenu = document.getElementById('shapeMenu');
    }

    initEventListeners() {
        this.sizeSlider.getValue = () => parseFloat(this.sizeSlider.slider.value);
    }

    initContextMenuHandlers() {
        const deleteButton = document.getElementById('deleteBall');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.deleteSelectedBall());
        } else {
            console.error('Element deleteButton not found');
        }
    }

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
                this.contextMenu.openContextMenu(event.clientX, event.clientY, clickedBall);
            }
        });
    }

    deleteSelectedBall() {
        if (this.selectedBall) {
            this.deleteBall(this.selectedBall);
            this.selectedBall = null;
        }
    }

    deleteBall(ball) {
        this.balls = this.balls.filter(b => b !== ball);
        this.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
    }

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

    setInitialPosition(element) {
        element.style.position = 'absolute';
        element.style.left = `${window.innerWidth - element.offsetWidth}px`;  
        element.style.top = '0px'; 
    }

    setupDraggableElements() {
        const elements = [
            this.menu,
            this.shapeMenu

        ];
        elements.forEach(el => {
            this.setupDraggableElement(el);
        });
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

    pauseBalls() {
        this.isPaused = true;
        this.toggleButton.showPlayButton();
        this.menu.classList.remove('hidden');
    }

    playBalls() {
        this.isPaused = false;
        this.toggleButton.showPauseButton();
        this.menu.classList.add('hidden');
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
        while (ballContainer.firstChild) {
            ballContainer.removeChild(ballContainer.firstChild);
        }

        newBall.renderInMenu(ballContainer);
        this.updateValues();
    }

    updateSizeDisplay() {
        const size = this.sizeSlider.getValue();
        const sizeDisplay = document.getElementById('sizeDisplay');
        if (sizeDisplay) {
            sizeDisplay.textContent = `Размер: ${size}`;
        }
    }

    updateCanvas(ctx) {
        const canvas = document.getElementById('myCanvas');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.shapeMenu.drawShapes(ctx);
        
        for (let ball of this.balls) {
            ball.draw(ctx);
        }
        
        this.contextMenu.updateBamTexts(ctx);
    }
}
