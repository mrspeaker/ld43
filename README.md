# Farm To Table

*The supramundane, numinous hamburger experience.*

[Play it.](https://mrspeaker.github.io/ld43/)

The Steakholders are angry, and they expect results. They - along with the humble and hard-working citizens of Farmtotabletown - have invested their faith in You. Faith in you, as their transcendental social and economic linchpin.

It sounds easy, but the perfect burger business may require a few sacrifices.

[![Farm To Table: the supramundane, numinous hamburger game](https://user-images.githubusercontent.com/129330/49464377-93742500-f7af-11e8-82d7-e7873d0a2a3a.png)](https://mrspeaker.github.io/ld43/)

## FAQ

* Q. Who are the Steakholders?
* A. Now you’re asking the right questions.

* Q. What is the purpose of burger?
* A. That’s like asking “What is time?”. Do you know? Because I think I may have ran out of it.


## Running the code

It's plain JS: no compiling/build tools. It uses JavaScript modules to load the code, so you need a reasonably recent browser to play it.

It also needs a web server to load the images and sounds (because you can't load resources directly in your browser from `file:///` anymore. *frowny face emoji*).

Start any simple web server in the root directory and load `index.html` in your browser. For example, if you have python installed: `python3 -m http.server` (or `python -m SimpleHTTPServer` for v2) then navigate to the server's default URL (eg http://localhost:8000)

### HERE BE DRAGONS

Disclaimer: code is pretty trash. It *started* nicely, devolved quickly. Biggest issue (if you're trying to follow the game logic) is the attempted-but-failed separation between the `Game` object and the `Town` (A Phaser.Scene) object. `Game` was supposed to hold all game data/logic, and `Town` was supposed to control the visible/renderable parts. As the 48 hours ran out, this separation became messy fast: some things are linked via the `Events` event system, some things are tacked on to sprites or data objects (`peep._sprite` and `peep._data` are both hacks to make the data and ui synced).

Some things are accessed directly from Town into Game object, others triggered by events. It's a mess.   
