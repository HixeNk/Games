class ToggleButton {
    constructor(playId, pauseId, playHandler, pauseHandler) {
        this.playButton = new Button(playId, playHandler);
        this.pauseButton = new Button(pauseId, pauseHandler);
    }

    showPlayButton() {
        this.playButton.show();
        this.pauseButton.hide();
    }

    showPauseButton() {
        this.playButton.hide();
        this.pauseButton.show();
    }
}