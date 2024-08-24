class SliderButton extends Button {
    constructor(id, changeHandler) {
        super(id, null);
        this.slider = document.getElementById(id);
        if (this.slider) {
            this.slider.addEventListener('input', changeHandler);
        } else {
            console.error(`Slider with ID "${id}" not found.`);
        }
    }

    getValue() {
        return parseFloat(this.slider.value);
    }
}