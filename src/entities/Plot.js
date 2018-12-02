import Events from "../Events.js";
import data from "../data.js";

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

    this.farmingTime = data.FARMING_BASE_TIME;

    this.name = "PL_" + btoa(Math.random() * 1000)
      .substr((Math.random() * 4) | 0, 6)
      .toUpperCase();
  }
  tick() {
    const { tilling, farmers } = this;
    if (!tilling || farmers.length == 0) {
      return;
    }

    // const farmingSkill = griller._data.culinary * data.GRILLING_SKILL_MULTIPIER;
    // this.grillTime -= (1 + grillerSkill);

    this.progress = Math.min(100, this.progress + farmers.length * 5);
    this._sprite.setFrame((((this.progress/100) * 5) | 0) + SPRITE);
    if (this.progress == 100) {
      this._sprite.visible = false;
      farmers.forEach(f => {
        f.working = false;
        f._sprite.anims.play("farm_idle");
      });
      Events.emit("plotHarvested", this);
      this.tilling = false;
      this.progress = 0;
      this.farmingTime = data.FARMING_BASE_TIME;
      this.farmers = [];
    }
  }
  addFarmer(peep) {
    if (this.farmers.length == 0) {
      // First farmer... lets go
      this._sprite.setFrame(SPRITE);
      this._sprite.visible = true;
      peep._sprite.anims.play("farm_action");
      peep.working = true;
      this.tilling = true;
    }
    this.farmers.push(peep);
  }
}

export default Plot;
