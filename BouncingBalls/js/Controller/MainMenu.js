// Класс для панели gameMenu
class MainMenu {
    constructor(controlPanel) {
        this.controlPanel = controlPanel;
        this.menu = document.getElementById('gameMenu');
        this.shapeMenu = document.getElementById('shapeMenu');
        this.materialMenu = document.getElementById('materialMenu');
        
        this.initElements();
        this.initEventListeners();
        this.setupDraggableElements();
    }

    initElements() {
        this.sizeSlider = new SliderButton('sizeRange', () => this.updateSizeDisplay());
        this.colorInput = document.getElementById('color');
        this.createBallButton = new Button('createBall', () => this.createBall());
        this.ballContainer = document.getElementById('ballContainer');
        this.speedSlider = new SliderButton('speed', () => this.controlPanel.updateValues());
        this.elasticitySlider = new SliderButton('elasticity', () => this.controlPanel.updateValues());
        this.toggleButton = new ToggleButton('play', 'pause', () => this.controlPanel.playBalls(), () => this.controlPanel.pauseBalls());
    }

    initEventListeners() {
        this.sizeSlider.getValue = () => parseFloat(this.sizeSlider.slider.value);
    }

    // Задаем перетаскиваемые элементы меню
    setupDraggableElements() {
        const elements = [
            this.menu,
            this.shapeMenu,
            this.materialMenu
        ];
        elements.forEach(el => {
            this.controlPanel.setupDraggableElement(el);
        });
    }

    // Изменение размеров элементов панелей
    updateSizeDisplay() {
        const size = this.sizeSlider.getValue();
        const sizeDisplay = document.getElementById('sizeDisplay');
        if (sizeDisplay) {
            sizeDisplay.textContent = `Размер: ${size}`;
        }
    }

    // Кнопка создания шарика
    createBall() {
        const radius = this.sizeSlider.getValue();
        const color = this.colorInput.value;
        const material = this.controlPanel.selectedMaterial || { name: 'Plastic', mass: 1 };

        const newBall = new Ball(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight,
            radius,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            color,
            material
        );

        const ballContainer = this.ballContainer;
        while (ballContainer.firstChild) {
            ballContainer.removeChild(ballContainer.firstChild);
        }

        newBall.renderInMenu(ballContainer);
        this.controlPanel.updateValues();
    }
}
