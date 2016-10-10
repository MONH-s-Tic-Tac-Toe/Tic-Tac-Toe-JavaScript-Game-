function MenuState(name) {

    this.name = name;
    let scene = new Scene(canvas.width, canvas.height),
        ctx = scene.getContext();

    let btns = [], angle = 0, frames = 0;

    let y = 100;
// Makes the fields in the menu page and uses the init function to initialize different pages
    btns.push(new MenuButton("One Player", 20, y, function() {
        state.get("game").init(ONE_PLAYER);
        state.change("game");
    }));
    btns.push(new MenuButton("Two Players", 20, y+70, function() {
        state.get("game").init(TWO_PLAYER);
        state.change("game");
    }));
    btns.push(new MenuButton("About", 20, y+140, function() {
        state.change("about", true);
    }));

    this.update = function() {
        frames++;
        angle = 0.2*Math.cos(frames*0.02);
    };

    this.render = function(_ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(190, 40);
        ctx.rotate(angle);
        ctx.font = "40px Helvetica";
        ctx.fillStyle = "skyblue";
        let txt = "Tic Tac Toe";
        ctx.fillText(txt, -ctx.measureText(txt).width/2, 18);
        ctx.restore();

        for (let i = btns.length;i--;) {
            btns[i].draw(ctx);
        }

        if (_ctx) {
            scene.draw(_ctx);
        } else {
            return scene.getCanvas();
        }
    }
}

let ONE_PLAYER = 1,
    TWO_PLAYER = 2;

function GameState(name) {
}

function AboutState(name) {
}