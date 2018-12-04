import Phaser from "../../lib/phaser.js";

import MainScene from "./scenes/Main.js";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 240,
  height: 320,
  parent: "board",
  pixelArt: true,
  scene: [MainScene],
  callbacks: {
    postBoot: function(game) {
      var config = game.config;
      var style = game.canvas.style;
      style.width = 2.5 * config.width + "px";
      style.height = 2.5 * config.height + "px";
    }
  }
});
