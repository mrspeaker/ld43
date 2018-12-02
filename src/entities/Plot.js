import Events from "../Events.js";

const SPRITE = 15;

export class PlotSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, "chars");
    this.setFrame(SPRITE);
    this.setOrigin(0, 0);
    this.setInteractive();
    this._data = data;
  }
}

class Plot {
  constructor() {
    this.type = "FARM";
    this.progress = 0;
    this.farmers = [];
    this.tilling = false;

    this.name = "PL_" + btoa(Math.random() * 1000)
      .substr((Math.random() * 4) | 0, 6)
      .toUpperCase();
  }
  tick() {
    const { tilling, farmers } = this;
    if (!tilling || farmers.length == 0) {
      return;
    }

    this.progress = Math.min(100, this.progress + farmers.length * 5);
    this._sprite.setFrame((((this.progress/100) * 5) | 0) + SPRITE);
    if (this.progress == 100) {
      this._sprite.visible = false;
      console.log("job done", this.farmers.length);
      farmers.forEach(f => {
        f.working = false;
        f._sprite.anims.play("farm_idle");
      });
      Events.emit("plotHarvested", this);
      this.tilling = false;
      this.progress = 0;
      this.farmers = [];
    }
  }
  addFarmer(peep) {
    if (this.farmers.length == 0) {
      // First farmer... lets go
      this._sprite.setFrame(SPRITE);
      this._sprite.visible = true;
      peep._sprite.anims.play("farm");
      peep.working = true;
      this.tilling = true;
    }
    this.farmers.push(peep);
  }
}

export default Plot;
