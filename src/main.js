import Phaser from "../../lib/phaser.js";
import Town from "./scenes/Town.js";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 240,
  height: 320,
  parent: "board",
  pixelArt: true,
  scene: [Town],
  callbacks: {
    postBoot: game => {
      const { width, height } = game.config;
      const style = game.canvas.style;
      style.width = 2.5 * width + "px";
      style.height = 2.5 * height + "px";
    }
  }
});
