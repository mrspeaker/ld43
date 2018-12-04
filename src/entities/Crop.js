import Phaser from "../../lib/phaser.js";

export class CropSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, "chars");
    this.setFrame(5);
    this.setOrigin(0.5, 0.3);
    this.setInteractive();
    this._data = data;
  }
}

class Crop {
  constructor() {
    this.name = "CR_" + btoa(Math.random() * 1000)
      .substr((Math.random() * 4) | 0, 6)
      .toUpperCase();

    this.age = 0;
    this.flavor = 0;
    this.type = "CROP";
  }
}

export default Crop;
