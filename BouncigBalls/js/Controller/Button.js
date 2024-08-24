class Button {
    constructor(id, clickHandler) {
        this.button = document.getElementById(id);
        if (this.button) {
            this.button.addEventListener('click', clickHandler);
        } else {
            console.error(`Button with ID "${id}" not found.`);
        }
    }

    hide() {
        if (this.button) {
            this.button.style.display = 'none';
        }
    }

    show() {
        if (this.button) {
            this.button.style.display = 'block';
        }
    }
}