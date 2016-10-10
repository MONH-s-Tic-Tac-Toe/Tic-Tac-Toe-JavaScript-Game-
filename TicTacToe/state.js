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

    this.name = name;
    let scene = new Scene(canvas.width, canvas.height),
        ctx = scene.getContext();

    let data, player, ai, isPlayer, aiMoved, mode, winner, winnerMsg, hastick;

    canvas.addEventListener("mousedown", function (evt) {
        if (winnerMsg && state.active_name === "game") {
            state.change("menu", true);
            return;
        }
        if (!isPlayer || winner || state.active_name !== "game" || !hastick) return;

        let px = mouse.x;
        let py = mouse.y;

        if (px % 120 >= 20 && py % 120 >= 20) {
            let idx = Math.floor(px/120);
            idx += Math.floor(py/120)*3;

            if (data[idx].hasData()) {
                return;
            }
            data[idx].flip(player);
            if (mode & ONE_PLAYER) {
                isPlayer = false;
            } else {
                player = player === Segment.NOUGHT ? Segment.CROSS : Segment.NOUGHT;
            }
        }
    }, false);

    this.init = function (_mode, segment) {

        mode = _mode || ONE_PLAYER;
        data = [];

        for (let i = 0; i < 9; i++) {
            let x = (i % 3)*120 + 20;
            let y = Math.floor(i/3)*120 + 20;
            data.push(new Segment(x, y));
        }

        player = segment || Segment.NOUGHT;

        isPlayer = player === Segment.NOUGHT;
        aiMoved = false;
        winner = false;
        winnerMsg = false;
        hastick = false;

        ai = new AIPlayer(data);
        ai.setSeed(player === Segment.NOUGHT ? Segment.CROSS : Segment.NOUGHT);

        if (mode & TWO_PLAYER) {
            player = Segment.NOUGHT;
            isPlayer = true;
        }
    };

    this.update = function() {
        if (winnerMsg) return;
        let activeAnim = false;
        for (let i = data.length; i--;) {
            data[i].update();
            activeAnim = activeAnim || data[i].active();
        }
        if (!activeAnim) {
            if (!aiMoved && !isPlayer) {
                let m = ai.move();
                if (m === -1) {
                    winner = true;
                } else {
                    data[m].flip(ai.setSeed());
                }
                isPlayer = true;
            }

            if (winner && !aiMoved) {
                if (winner === true) {
                    winnerMsg = "The game was a draw!";
                } else if (winner === Segment.NOUGHT) {
                    winnerMsg = "The Nought player won!";
                } else {
                    winnerMsg = "The Cross player won!";
                }
            }

            aiMoved = true;
        } else {
            if (aiMoved) {
                winner = ai.hasWinner();
            }
            aiMoved = false;
        }
        hastick = true;
    };

    this.render = function (_ctx) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = data.length; i--;) {
            data[i].draw(ctx);
        }
        if (winnerMsg) {
            let s = 10, lw = 2, w = 300, h = 80;

            w -= lw;
            h -= lw;

            ctx.save();
            ctx.translate((canvas.width - w + lw)/2, (canvas.height - h + lw)/2);
            ctx.fillStyle = "white";
            ctx.strokeStyle = "skyblue";
            ctx.lineWidth = lw;
            ctx.font = "20px Helvetica";

            ctx.beginPath();
            ctx.arc(s, s, s, Math.PI, 1.5*Math.PI);
            ctx.arc(w-s, s, s, 1.5*Math.PI, 0);
            ctx.arc(w-s, h-s, s, 0, 0.5*Math.PI);
            ctx.arc(s, h-s, s, 0.5*Math.PI, Math.PI);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "skyblue";
            let txt = winnerMsg;
            ctx.fillText(txt, w/2 - ctx.measureText(txt).width/2, 45);

            ctx.restore();
        }

        if (_ctx) {
            scene.draw(_ctx);
        } else {
            return scene.getCanvas();
        }
    }

}

function AboutState(name) {
}