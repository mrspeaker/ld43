import Events from "../Events.js";

export class PlotSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, "chars");
    this.setFrame(15);
    this.setOrigin(0, 0);
    this._data = data;
  }
}

class Plot {
  constructor() {
    this.progress = 0;
    this.farmers = [];
    this.tilling = true;
  }
  tick() {
    const { tilling, farmers } = this;
    if (!tilling || farmers.length == 0) {
      return;
    }

    this.progress += farmers.length * 2;
    this._sprite.setFrame((((this.progress/100) * 5) | 0) + 15);
    if (this.progress >= 100) {
      this._sprite.visible = false;
      this.tilling = false;
      Events.emit("plotHarvested", this);
    }
  }
  addFarmer(peep) {
    if (this.farmers.length == 0) {
      // First farmer... lets go
      this._sprite.visible = true;
    }
    this.farmers.push(peep);
  }
}

export default Plot;
