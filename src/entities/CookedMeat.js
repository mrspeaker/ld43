export class CookedMeatSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, "chars");
    this.setFrame(7);
    this.setOrigin(0.5, 0.5);
    this.setInteractive();
    this._data = data;
  }
}

class CookedMeat {
  constructor() {
    this.name = "MT" + btoa(Math.random() * 1000)
      .substr((Math.random() * 4) | 0, 6)
      .toUpperCase();

    this.age = 0;
    this.flavor = 0;
    this.type = "COOKED_MEAT";
  }
}

export default CookedMeat;
