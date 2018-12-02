export class BurgerSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, "chars");
    this.setFrame(8);
    this.setOrigin(0.5, 0.5);
    this.setInteractive();
    this._data = data;
  }
}

class Burger {
  constructor(produce, meat) {
    this.name = "BURG_" + btoa(Math.random() * 1000)
      .substr((Math.random() * 4) | 0, 6)
      .toUpperCase();

    this.age = 0;
    this.flavor = 0;
    this.type = "BURGER";
  }
}

export default Burger;
