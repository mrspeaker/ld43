const Phaser = window.Phaser;
const emitter = new Phaser.Events.EventEmitter();

const Events = {
  on: (name, handler) => {
    emitter.on(name, handler);
  },
  emit: (name, ...args) => {
    emitter.emit(name, ...args);
  }
};

export default Events;
