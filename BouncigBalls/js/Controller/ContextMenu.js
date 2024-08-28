class ContextMenu {
    constructor(balls, updateCanvas) {
        this.balls = balls;
        this.updateCanvas = updateCanvas;
        this.deleteBall = null;
        this.contextMenu = document.getElementById('contextMenu');
        this.contextColor = document.getElementById('contextColor');
        this.contextSizeRange = new SliderButton('contextSizeRange', () => this.updateContextSizeDisplay());
        this.contextSizeValue = document.getElementById('contextSizeValue');
        this.applyChangesButton = new Button('applyChanges', () => this.applyChanges());
        this.closeMenuButton = new Button('closeMenu', () => this.closeContextMenu());
        this.startEventButton = new Button('StartEvent', () => this.startEvent());
        this.endEventButton = new Button('EndEvent', () => this.endEvent());
        this.selectedBall = null;
        this.callbacks = {};  // Store callbacks here
        this.bamTexts = []; // Initialize bamTexts array
        this.initContextMenuHandlers();
    }

    // Метод для установки колбэков из ControlPanel
    setCallbacks(updateCanvasCallback, deleteBallCallback) {
        this.callbacks.updateCanvas = updateCanvasCallback;
        this.deleteBall = deleteBallCallback; // Установите deleteBallCallback
    }

    deleteSelectedBall() {
        if (this.selectedBall) {
            if (this.deleteBall) {
                this.deleteBall(this.selectedBall); // Вызов колбэка
            }
            this.closeContextMenu();
        }
    }

    initContextMenuHandlers() {
        const deleteButton = document.getElementById('deleteBall');
        deleteButton.addEventListener('click', () => this.deleteSelectedBall());
    }

    openContextMenu(x, y, ball) {
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.remove('hidden');

        this.contextColor.value = ball.color;
        this.contextSizeRange.slider.value = ball.radius;
        this.updateContextSizeDisplay();
        this.selectedBall = ball;
    }

    closeContextMenu() {
        this.contextMenu.classList.add('hidden');
        this.selectedBall = null;
    }

    applyChanges() {
        if (this.selectedBall) {
            this.selectedBall.color = this.contextColor.value;
            this.selectedBall.radius = parseFloat(this.contextSizeRange.getValue());
            if (this.callbacks.updateCanvas) {
                this.callbacks.updateCanvas(document.getElementById('myCanvas').getContext('2d'));
            }
        }
        this.closeContextMenu();
    }

    updateContextSizeDisplay() {
        this.contextSizeValue.textContent = this.contextSizeRange.getValue();
    }

    startEvent() {
        if (this.selectedBall) {
            this.selectedBall.onCollision = (x, y) => {
                this.drawBamText(x, y);
            };
        }
    }
    
    endEvent() {
        if (this.selectedBall) {
            this.selectedBall.onCollision = null;
        }
    }
    

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
        this.bamTexts.push(bamText);  // Safely push to bamTexts
    }

    // Метод для обновления текста BAM на канвасе
    updateBamTexts(ctx) {
        const currentTime = Date.now();
        this.bamTexts.forEach(bamText => {
            const elapsedTime = currentTime - bamText.startTime;
    
            if (elapsedTime > 2000) {
                // Очистить область, где был текст BAM
                ctx.clearRect(bamText.x, bamText.y - bamText.height, bamText.width, bamText.height);
            } else {
                ctx.font = '20px Arial';
                ctx.fillStyle = 'red';
                ctx.fillText('BAM', bamText.x, bamText.y);
            }
        });
    
        // Удаляем старые записи из массива после их удаления с экрана
        this.bamTexts = this.bamTexts.filter(bamText => currentTime - bamText.startTime <= 2000);
    }
    
}
