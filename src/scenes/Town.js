import Phaser from "../../lib/phaser.js";
import { PeepSprite } from "../entities/Peep.js";
import { CropSprite } from "../entities/Crop.js";
import { PlotSprite } from "../entities/Plot.js";
import { CookedMeatSprite } from "../entities/CookedMeat.js";
import { BurgerSprite } from "../entities/Burger.js";
import { PattySprite } from "../entities/Patty.js";
import { CarSprite } from "../entities/Car.js";
import PeepTypes from "../entities/PeepTypes.js";
import Game from "../Game.js";
import Events from "../Events.js";

const isIn = (go, minX, minY, maxX, maxY) => {
  return go.x >= minX && go.x < maxX && go.y >= minY && go.y < maxY;
};

const Areas = {
  Incubator: [120, 88, 190, 136],
  Queue: [3, 81, 110, 141],
  Farm: [3, 146, 111, 221],
  Kitchen: [140, 147, 229, 237],
  Grinder: [148, 239, 223, 275],
  LoveShack: [196, 62, 236, 123],
  CropSpawn: [118, 144],
  PattySpawn: [210, 290],
  CookedSpawn: [136, 144],
  BurgerSpawn: [127, 240],
  CarSpawn: [-100, 300]
};

const HoverableAreas = [
  Areas.Queue,
  Areas.Farm,
  Areas.Kitchen,
  Areas.Grinder,
  Areas.LoveShack
].map(
  ([x1, y1, x2, y2]) => new Phaser.Geom.Rectangle(x1, y1, x2 - x1, y2 - y1)
);

const PeepStatIdx = {
  CULINARY: 0,
  BOTANY: 1,
  TENDERNESS: 2,
  VIRILITY: 3
};

class Town extends Phaser.Scene {
  constructor() {
    super({ key: "Town" });

    // TODO: REFACTOR! this class was mostly to sync the display
    // with the Game, but it devolved - logic shared with Game and Town.
    this.handleCustomGameEvents();
  }
  preload() {
    this.load.image("bg", "res/sgb.png");
    this.load.image("bgfg", "res/sgbgb.png");
    this.load.image("car", "res/car.png");
    this.load.image("char", "res/char1.png");
    this.load.image("roof", "res/roof.png");
    this.load.image("font", "res/font.png");

    this.load.spritesheet("peeps", "res/peeps.png", {
      frameWidth: 12,
      frameHeight: 14
    });
    this.load.spritesheet("chars", "res/chars.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.audio("mouse", "res/audio/click.mp3");
    this.load.audio("grinded", "res/audio/crunch.mp3");
    this.load.audio("pop", "res/audio/pop.mp3");
    this.load.audio("nope", "res/audio/nope.mp3");
    this.load.audio("ding", "res/audio/ding.mp3");
    this.load.audio("theme", "res/audio/theme.mp3");
  }

  create() {
    this.game = new Game();
    this.initNoobs = this.game.peeps.length;
    this.lastNoob = 0;

    this.audio = {
      mouse: this.sound.add("mouse"),
      grinded: this.sound.add("grinded"),
      pop: this.sound.add("pop"),
      nope: this.sound.add("nope"),
      ding: this.sound.add("ding"),
      theme: this.sound.add("theme", {
        loop: true,
        volume: 0.7
      })
    };

    this.add.image(120, 160, "bg");

    const mouse = this.add.sprite(40, 40, "chars");
    mouse.setOrigin(0, 0);
    mouse.setFrame(10);
    this.children.bringToTop(mouse);
    mouse.depth = 1000;

    // TODO: create some containrs instead!
    // Created here for z-ordering.
    this.game.farm.createPlots();

    this.createAnims();
    this.addConveyorBelts();

    // TODO: only used to (badly) reference Title text. Fix this.
    const dialog = this.add.container(0, 0);
    this.dialog = dialog;

    this.cache.bitmapFont.add(
      "font",
      Phaser.GameObjects.RetroFont.Parse(this, {
        image: "font",
        width: 6,
        height: 8,
        chars: Phaser.GameObjects.RetroFont.TEXT_SET6,
        charsPerRow: 10,
        spacing: { x: 0, y: 0 }
      })
    );

    const print = (x, y, msg) => {
      return this.add.bitmapText(x, y, "font", msg);
    };

    const title = print(0, 10, "FARM TO TABLE");
    dialog.add(title);
    title.setTint(0xff00ff);

    // Peep Stats.
    const ps = this.add.container();
    ps.visible = false;
    ps.add(print(0, 30, "CULINARY: "));
    ps.add(print(0, 40, "BOTANY: "));
    ps.add(print(0, 50, "TENDERNESS: "));
    ps.add(print(0, 60, "VIRILITY: "));
    const pstats = [
      print(70, 30, "0"),
      print(70, 40, "0"),
      print(70, 50, "0"),
      print(70, 60, "0")
    ].map(p => {
      ps.add(p);
      p.setTint(0xff00ff);
      return p;
    });

    this.stats = {
      peepDisplay: ps,
      peep: pstats
    };

    // The "moood"/score (TODO: not done! progress is meaningless!)
    // this.addGraphAndCharts();
    print(140, 10, "STEAKHOLDERS ARE");
    const mood = print(160, 20, this.game.mood.mood());
    mood.setTint(0xff00ff);

    const setMood = () => {
      this.game.mood.rnd(); // Lol.. don't tell anyone! Random!
      mood.text = this.game.mood.mood();
      setTimeout(setMood, Phaser.Math.Between(6000, 22000));
    };
    setTimeout(setMood, Phaser.Math.Between(15000, 35000));

    print(0, 84, "JOB SEEKERS");
    print(176, 126, "LOVE SHACK");
    print(1, 147, "THE FARM");
    print(156, 156, "THE GRILL");
    print(153, 259, "THE GRINDER");

    this.peeps = [...Array(10)].map((_, i) => {
      return this.createAPeepSprite(this.game.peeps[i]);
    });

    const fg = this.add.container();
    fg.add(this.add.image(176, 56, "bgfg"));
    fg.add(this.add.image(123, 240, "roof"));
    fg.depth = 500;

    // Love hearts for the love shack
    this.loveSprite = this.add.sprite(220, 50, "chars");
    this.loveSprite.anims.play("love");
    this.loveSprite.visible = false;

    // Outline when mouse-ing over
    this.hoverHelper = this.add.graphics();
    this.handlePointer(mouse);

    // Schedule theme song...
    setTimeout(() => {
      this.audio.theme.play();
    }, 10000);
    this.cameras.main.fadeIn(6000);
  }

  update(time, dt) {
    this.game.update(time, dt);

    if (this.initNoobs > 0) {
      if (time - this.lastNoob > 1000) {
        this.initNoobs--;
        this.assignPeep(this.peeps[this.initNoobs], PeepTypes.UNASSIGNED);
        this.lastNoob = time;
      }
    } else {
      // TODO: make new peeps take a (constant) while to grow up...
      // slow the anim, and don't make the init flock use it.
      if (Math.random() < 0.005) {
        const noobs = this.peeps.filter(
          p => p._data.peepType === PeepTypes.NOOB
        );
        if (noobs.length) {
          this.assignPeep(noobs[0], PeepTypes.UNASSIGNED);
        }
      }
    }
  }

  createAnims() {
    const { anims } = this;
    const range = (start, end, img = "peeps") =>
      anims.generateFrameNumbers(img, { start, end });
    const anim = (key, frames, frameRate, repeat = -1) => {
      return anims.create({ key, frames, frameRate, repeat });
    };

    anim("peep_idle", range(0, 0), 10);
    anim("peep_action", range(0, 1), 10);
    anim("farm_idle", range(5, 5), 5);
    anim("farm_action", range(5, 6), 5);
    anim("grill_idle", range(10, 10), 5);
    anim("grill_action", range(10, 11), 5);
    anim("grinded", range(15, 24), 10, 0);
    anim("growup", range(25, 29), 1, 0);

    anim("belt_down", range(20, 23, "chars"), 3);
    anims("love", range(25, 29, "chars"), 8);
  }

  handlePointer(mouse) {
    // INPUT Handling for selecting/dragging peeps
    let selected = null;
    let dragSelected = false;

    this.input.on("pointermove", pointer => {
      const { hoverHelper } = this;
      mouse.x = pointer.x;
      mouse.y = pointer.y;

      hoverHelper.visible = false;
      if (dragSelected) {
        // Check if hovering
        const mouseBounds = mouse.getBounds();
        HoverableAreas.forEach(rect => {
          const collide = Phaser.Geom.Rectangle.Overlaps(mouseBounds, rect);
          if (collide) {
            hoverHelper.clear();
            hoverHelper.lineStyle(1, 0x00ff00, 1);
            hoverHelper.strokeRect(rect.x, rect.y, rect.width, rect.height);
            hoverHelper.visible = true;
          }
        });
      }
    });

    this.input.on("gameobjectover", (pointer, gameObject) => {
      // Nothing selected
      if (dragSelected) {
        return;
      }

      if (selected && selected !== gameObject) {
        selected.clearTint();
        this.clearInfo();
        selected = null;
      }
      if (!selected) {
        selected = gameObject;
        //this.audio.mouse.play();

        dragSelected = false;
        gameObject.setTint(0x00ff00);
        this.displayInfo(gameObject);
        return;
      }
    });

    this.input.on("gameobjectdown", (pointer, gameObject) => {
      // NOTE: last minute control change: hover to select, click to dragSelect
      // Im sure a bunch of the logic in here is redundant now!

      if (!dragSelected) {
        this.audio.mouse.play();
        gameObject.downX = pointer.downX;
        gameObject.downY = pointer.downY;
      }

      // When selecting something from nothing
      if (!selected) {
        selected = gameObject;
        this.audio.mouse.play();

        dragSelected = false;
        gameObject.setTint(0x00ff00);
        this.displayInfo(gameObject);

        gameObject.downX = pointer.downX;
        gameObject.downY = pointer.downY;
        return;
      }

      // For "reverting" if switch to different peep...
      if (selected !== gameObject) {
        gameObject.downX = pointer.downX;
        gameObject.downY = pointer.downY;
      }

      // Double clicked self - draggin'
      if (
        !dragSelected &&
        gameObject._data.draggable &&
        selected === gameObject
      ) {
        if (gameObject._data && gameObject._data.working) {
          selected.clearTint();
          selected = null;
          this.audio.nope.play();
          return;
        }
        dragSelected = true;
        if (gameObject._timeline) {
          gameObject._timeline.stop();
          gameObject._timeline = null;
        }
        gameObject.setTint(0xff00ff);
        return;
      }

      selected.clearTint();

      if (dragSelected && gameObject._data.draggable) {
        this.assignFromXY(selected);
        dragSelected = false;
        selected = null;
        this.clearInfo();
        return;
      }

      // Clicked on yourself
      if (selected === gameObject) {
        selected = null;
        dragSelected = false;
        return;
      }
      // Clicked on a new peep
      selected = gameObject;
      this.audio.mouse.play();

      dragSelected = false;
      gameObject.setTint(0x00ff00);
      this.displayInfo(gameObject);
    });

    this.input.on("pointermove", p => {
      if (selected && dragSelected) {
        selected.x = p.x;
        selected.y = p.y;
      }
    });
  }

  addGraphAndCharts() {
    const line1 = this.add.graphics();
    const line2 = this.add.graphics();
    line1.lineStyle(1, 0x00ff00, 1);
    line2.lineStyle(1, 0xe43b44, 1);
    line1.beginPath();
    line2.beginPath();

    line1.moveTo(0, 40);
    line2.moveTo(0, 60);
    const yo = 60;
    for (var i = 0; i < 25; i++) {
      line1.lineTo(i * 10, (yo + Math.random() * 20) | 0);
      line2.lineTo(i * 10, (yo + Math.random() * 20) | 0);
    }
    line1.strokePath();
    line2.strokePath();
  }

  addConveyorBelts() {
    // Make some belts
    for (let i = 0; i < 8; i++) {
      if (i < 6) {
        const b1 = this.add.sprite(120, 160 + i * 16 - 8, "chars");
        b1.anims.play("belt_down");
        const b2 = this.add.sprite(120 + 16, 160 + i * 16 - 8, "chars");
        b2.anims.play("belt_down", false, 1);
      }
      const b3 = this.add.sprite(216 + 16, 160 + i * 16 - 8, "chars");
      b3.setScale(1, -1);
      b3.anims.play("belt_down");
    }
    for (let i = 0; i < 2; i++) {
      const s1 = this.add.sprite(110 + i * 16, 279, "chars");
      s1.setRotation(Math.PI / 2);
      s1.anims.play("belt_down");

      const b1 = this.add.sprite(128, 257 + i * 16 - 8, "chars");
      b1.anims.play("belt_down");
    }
  }

  createAPeepSprite(peepData) {
    const p = new PeepSprite(this, 0, 0, peepData);
    this.assignPeep(p, PeepTypes.NOOB);
    this.add.existing(p);
    p.anims.play("growup");
    return p;
  }

  getAreaFromXY(peep) {
    // TODO: do this with Phaser.Rect.Overlaps like the hover outline
    if (isIn(peep, ...Areas.Incubator)) {
      return PeepTypes.NOOB;
    }
    if (isIn(peep, ...Areas.Queue)) {
      return PeepTypes.UNASSIGNED;
    }
    if (isIn(peep, ...Areas.Farm)) {
      return PeepTypes.FARMER;
    }
    if (isIn(peep, ...Areas.Kitchen)) {
      return PeepTypes.GRILLER;
    }
    if (isIn(peep, ...Areas.Grinder)) {
      return PeepTypes.MEAT;
    }
    if (isIn(peep, ...Areas.LoveShack)) {
      return PeepTypes.MATE;
    }

    return PeepTypes.OFF_THE_GRID;
  }

  assignFromXY(peep) {
    const area = this.getAreaFromXY(peep);
    if (area == PeepTypes.NOOB || area == PeepTypes.OFF_THE_GRID) {
      this.revertDrag(peep);
    } else {
      if (area !== peep._data.peepType) {
        this.assignPeep(peep, area);
      }
    }
  }

  revertDrag(peep) {
    if (peep._data._lastPeepType) {
      peep._data.peepType = peep._data._lastPeepType;
    }

    const t = this.tweens.createTimeline();
    t.add({
      targets: peep,
      x: peep.downX,
      y: peep.downY,
      duration: 200
    });
    t.play();
  }

  assignPeep(peep, type) {
    peep._data._lastPeepType = peep._data.peepType;

    if (peep._data.onChangeJobs) {
      peep._data.onChangeJobs();
      peep._data.onChangeJobs = null;
    }

    peep._data.peepType = type;
    if (type == PeepTypes.NOOB) {
      const [minX, minY, maxX, maxY] = Areas.Incubator;
      peep.x = Phaser.Math.Between(minX, maxX);
      peep.y = Phaser.Math.Between(minY, maxY);
    }
    if (type == PeepTypes.UNASSIGNED) {
      this.waitForAJob(peep);
    }
    if (type == PeepTypes.FARMER) {
      this.game.addFarmer(peep._data);
    }
    if (type == PeepTypes.MEAT) {
      this.game.addBeefling(peep._data);
    }
    if (type == PeepTypes.MATE) {
      this.game.addLoveShacker(peep);
    }
    if (type == PeepTypes.GRILLER) {
      this.game.addGriller(peep);
    }
  }

  displayInfo(ent) {
    const { dialog, stats } = this;
    const { peep, peepDisplay } = stats;
    this.clearInfo();

    // Set title
    dialog.first.text = ent._data.name + " - " + ent._data.type;

    if (ent._data.type === "PEEP") {
      peepDisplay.visible = true;
      peep[PeepStatIdx.CULINARY].text = ent._data.culinary;
      peep[PeepStatIdx.BOTANY].text = ent._data.botany;
      peep[PeepStatIdx.TENDERNESS].text = ent._data.tenderness;
      peep[PeepStatIdx.VIRILITY].text = ent._data.virility;
    }
  }

  clearInfo() {
    const { dialog } = this;
    const txt = dialog.first;
    txt.text = "";
    this.stats.peepDisplay.visible = false;
  }

  waitForAJob(peepSprite) {
    const peep = peepSprite._data;
    peep.working = false;
    const gs = this.peeps.filter(
      p => p._data.peepType === PeepTypes.UNASSIGNED
    );

    const cook = peep.culinary;
    const grow = peep.botany;
    let specialty =
      cook > 2 || grow > 2 ? (cook > grow ? "grill" : "farm") : "peep";

    // Don't show the skins at the start... will confuse people
    if (this.time.now < 30000) {
      specialty = "peep";
    }
    peepSprite.anims.play(`${specialty}_action`);

    // Follow the queue line
    const timeline = this.tweens.createTimeline();

    let xo = Areas.Queue[2] - 10;
    let yo = Areas.Queue[1] + 16;

    timeline.add({
      targets: peepSprite,
      x: xo,
      y: yo,
      scaleX: -1
    });

    timeline.add({
      targets: peepSprite,
      x: (xo -= 85),
      duration: 2000
    });

    timeline.add({
      targets: peepSprite,
      y: (yo += 15),
      duration: 500,
      scaleX: 1
    });

    timeline.add({
      targets: peepSprite,
      x: (xo += 80),
      duration: 2000
    });

    timeline.add({
      targets: peepSprite,
      y: (yo += 20),
      duration: 500,
      scaleX: -1
    });

    // HACK: scatter instead of queue after initial display,
    // because my queuing logic is non-existent!
    const final_move = {
      targets: peepSprite,
      duration: 500,
      onComplete: () => {
        peepSprite.anims.play(`${specialty}_idle`);
        peepSprite.setScale(Math.random() < 0.5 ? -1 : 1, 1);
      }
    };
    if (this.time.now < 15000) {
      // normal queing
      final_move.x = 20 + (gs.length - 1) * 10;
    } else {
      // scatter around
      final_move.x = Phaser.Math.Between(Areas.Queue[0], Areas.Queue[2]);
      final_move.y = Phaser.Math.Between(Areas.Queue[1], Areas.Queue[3]);
    }
    timeline.add(final_move);

    peepSprite._timeline = timeline;

    timeline.play();
  }

  handleCustomGameEvents() {
    Events.on("jobRejection", peep => {
      this.revertDrag(peep);
    });
    Events.on("workerFree", peep => {
      this.assignPeep(peep._sprite || peep, PeepTypes.UNASSIGNED);
    });
    Events.on("loveStarts", () => {
      this.loveSprite.visible = true;
    });
    Events.on("newCrop", crop => {
      const sprite = new CropSprite(
        this,
        Areas.CropSpawn[0],
        Areas.CropSpawn[1],
        crop
      );
      this.add.existing(sprite);
      crop._sprite = sprite;
      const activeProduce =
        this.game.produce.length + this.game.produce_in_transit.length;
      const t = this.tweens.createTimeline();
      t.add({
        targets: sprite,
        y: Areas.CropSpawn[1] + 96 - activeProduce * 16,
        duration: 5000,
        onComplete: () => {
          Events.emit("produceHasArrived", crop);
        }
      });
      t.play();
    });

    Events.on("newPlot", (plot, x, y) => {
      const sprite = new PlotSprite(this, x, y, plot);
      sprite.visible = false;
      this.add.existing(sprite);
      plot._sprite = sprite;
    });

    Events.on("newCookedMeat", meat => {
      const sprite = new CookedMeatSprite(
        this,
        Areas.CookedSpawn[0],
        Areas.CookedSpawn[1],
        meat
      );
      this.add.existing(sprite);
      meat._sprite = sprite;
      const t = this.tweens.createTimeline();
      const activePatties =
        this.game.cooked_meat.length + this.game.cooked_meat_in_transit.length;
      t.add({
        targets: sprite,
        y: Areas.CookedSpawn[1] + 96 - activePatties * 16,
        duration: 5000,
        onComplete: () => {
          Events.emit("cookedMeatHasArrived", meat);
        }
      });
      t.play();
    });

    Events.on("newPattie", (peep, patty) => {
      // Turn a peep into a patty
      patty.readyToCook = false;
      this.peeps = this.peeps.filter(p => {
        if (p._data === peep) {
          p.destroy();

          const sprite = new PattySprite(
            this,
            Areas.PattySpawn[0],
            Areas.PattySpawn[1],
            patty
          );
          this.add.existing(sprite);
          patty._sprite = sprite;

          const t = this.tweens.createTimeline();
          t.add({
            targets: sprite,
            x: Areas.PattySpawn[0] + 20,
            duration: 500
          });
          t.add({
            targets: sprite,
            y: Areas.PattySpawn[1] - 146 + this.game.grill.patties.length * 16,
            duration: 4000,
            onComplete: () => {
              patty.readyToCook = true;
            }
          });
          t.play();

          return false;
        }
        return true;
      });
    });

    Events.on("newPeep", (baby, parent1, parent2) => {
      const peep = this.createAPeepSprite(baby);
      this.peeps.push(peep);
      this.loveSprite.visible = false;
      parent1.visible = true;
      parent2.visible = true;
      this.assignPeep(parent1, PeepTypes.UNASSIGNED);

      // Stagger second paren't return to queue
      setTimeout(() => {
        this.assignPeep(parent2, PeepTypes.UNASSIGNED);
      }, 800);
    });

    Events.on("newCar", car => {
      const sprite = new CarSprite(
        this,
        Areas.CarSpawn[0],
        Areas.CarSpawn[1],
        car
      );
      this.add.existing(sprite);
      car._sprite = sprite;

      const t = this.tweens.createTimeline();
      t.add({
        targets: sprite,
        x: 50,
        duration: 3000,
        ease: "Cubic",
        onComplete: () => {
          Events.emit("carAtWindow", car);
        }
      });
      t.play();

      car.onOrderFilled = burger => {
        const t = this.tweens.createTimeline();
        burger._sprite.visible = false;
        t.add({
          targets: [sprite],
          x: 320,
          duration: 4000,
          ease: "CubicOut",
          onComplete: () => {
            car._sprite.destroy();
            burger._sprite.destroy();
          }
        });
        t.play();
      };
    });

    Events.on("newBurger", burger => {
      const sprite = new BurgerSprite(
        this,
        Areas.BurgerSpawn[0],
        Areas.BurgerSpawn[1],
        burger
      );
      this.add.existing(sprite);
      burger._sprite = sprite;

      this.audio.ding.play();

      const t = this.tweens.createTimeline();
      t.add({
        targets: sprite,
        y: Areas.BurgerSpawn[1] + 39,
        duration: 3000
      });
      t.add({
        targets: sprite,
        x: Areas.BurgerSpawn[0] - 22,
        duration: 1000,
        onComplete: () => {
          sprite.x = 85;
          sprite.y = 300;
          Events.emit("orderFilled", burger);
        }
      });
      t.play();
    });

    Events.on("grindingPeep", () => {
      this.audio.grinded.play();
    });
    Events.on("groundPeep", () => {
      this.audio.pop.play();
    });
  }
}

export default Town;
