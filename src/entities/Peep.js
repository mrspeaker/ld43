import Phaser from "../../lib/phaser.js";
import PeepTypes from "./PeepTypes.js";

export class PeepSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, "peeps");
    this.setOrigin(0.5, 1);
    this.setInteractive();
    // NOTE: "data" is used internally in Phaser :()
    this._data = data;
    data._sprite = this; // Sorry :)
  }
}

class Peep {
  constructor() {
    this.name = btoa(Math.random() * 1000)
      .substr((Math.random() * 4) | 0, 6)
      .toUpperCase();
    this.type = "PEEP";
    this.draggable = true;
    this.peepType = PeepTypes.NOOB;
    this.working = true; // Born working, yo.

    this.hp = 0;
    this.age = 0;

    this.botany = 0;
    this.culinary = 0;
    this.tenderness = 0;
    this.virility = 0;
  }
}

export default Peep;
