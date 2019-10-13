const remote = require("electron").remote;

function hideMenuShowGame() {
    remote.getCurrentWindow().loadFile('gameScreen.html');
}