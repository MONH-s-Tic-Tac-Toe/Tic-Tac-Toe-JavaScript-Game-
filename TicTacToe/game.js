function StateManager() {

    let state = {},
        next = null,
        active = null,
        anim = 0,
        right = false;

    this.active_name = null;

    this.add = function () {
        for (let i = arguments.length; i--;) {
            let arg = arguments[i];
            state[arg.name] = arg;
        }
    };
    this.set = function (name) {
        active = state[name];
        this.active_name = name;
    };
    this.get = function (name) {
        return state[name];
    };
    this.change = function (name, _right) {
        anim = 0;
        right = _right || false;
        next = name;
        this.active_name = name;
    };
    this.tick = function (ctx) {
        if (next) {
            if (anim <= 1) {
                anim += 0.02;

                active.update();
                state[next].update();

                let c1 = active.render(),
                    c2 = state[next].render(),

                    c1w = c1.width,
                    c1h = c1.height,
                    c2w = c2.width,
                    c2h = c2.height,

                    res = 2,

                    p,
                    t = anim;
                p = t < 0.5 ? 2 * t * t : -2 * (t * (t - 2)) - 1;

                if (right) {
                    p = 1 - p;
                    let t = c2;
                    c2 = c1;
                    c1 = t;
                }

                for (let i = 0; i < c1w; i += res) {
                    ctx.drawImage(c1, i, 0, res, c1h,
                        i - p * i,
                        (c1w - i) * p * 0.2,
                        res,
                        c1h - (c1w - i) * p * 0.4
                    );
                }
                p = 1 - p;
                for (let i = 0; i < c2w; i += res) {
                    ctx.drawImage(c2, i, 0, res, c2h,
                        i - (i - c2w) * p,
                        i * p * 0.2,
                        res,
                        c1h - i * p * 0.4
                    );
                }

            } else {
                active = state[next];
                next = false;
                active.update();
                active.render(ctx);
            }
        } else {
            active.update();
            active.render(ctx);
        }
    }
}

function Tile(x, y) {

    let tile = Tile.BLANK;
    let anim = 0;

    if (tile == null) {
        (function () {
            let _c = document.createElement("canvas");
            _c.width = _c.height = 100;
            let _ctx = _c.getContext("2d");
// Tile style
            _ctx.fillStyle = "beige";
            _ctx.lineWidth = 4;
            _ctx.strokeStyle = "brown";
            _ctx.lineCap = "round";

            // Blank
            _ctx.fillRect(0, 0, 100, 100);
            Tile.BLANK = new Image();
            Tile.BLANK.src = _c.toDataURL();

            // Nought
            _ctx.fillRect(0, 0, 100, 100);

            _ctx.beginPath();
            _ctx.arc(50, 50, 30, 0, 2 * Math.PI);
            _ctx.stroke();

            Tile.NOUGHT = new Image();
            Tile.NOUGHT.src = _c.toDataURL();

            // Cross
            _ctx.fillRect(0, 0, 100, 100);

            _ctx.beginPath();
            _ctx.moveTo(20, 20);
            _ctx.lineTo(80, 80);
            _ctx.moveTo(80, 20);
            _ctx.lineTo(20, 80);
            _ctx.stroke();

            Tile.CROSS = new Image();
            Tile.CROSS.src = _c.toDataURL();
        })();
        tile = Tile.BLANK;
    }

    this.active = function () {
        return anim > 0;
    };

    this.equals = function (_tile) {
        return tile === _tile;
    };

    this.hasData = function () {
        return tile !== Tile.BLANK;
    };

    this.set = function (next) {
        tile = next;
    };

    this.flip = function (next) {
        tile = next;
        anim = 1;
    };

    this.update = function () {
        if (anim > 0) {
            anim -= 0.02;
        }
    };

    this.draw = function (ctx) {
        if (anim <= 0) {
            ctx.drawImage(tile, x, y);
            return;
        }

        let res = 2;
        let t = anim > 0.5 ? Tile.BLANK : tile;
        let p = -Math.abs(2 * anim - 1) + 1;

        p *= p;

        for (let i = 0; i < 100; i += res) {

            let j = 50 - (anim > 0.5 ? 100 - i : i);

            ctx.drawImage(t, i, 0, res, 100,
                x + i - p * i + 50 * p,
                y - j * p * 0.2,
                res,
                100 + j * p * 0.4
            );
        }
    }
}
// game logic
function AIPlayer(data) {

    let seed, oppSeed;

    this.setSeed = function (_seed) {
        seed = _seed;
        oppSeed = _seed === Tile.NOUGHT ? Tile.CROSS : Tile.NOUGHT;
    };

    this.getSeed = function () {
        return seed;
    };

    this.move = function () {

        // dumb down algorithm result according to difficulty
        let values = minimax(2, seed);
        let bestMove = values[1];
        let nextMoves = values[2];
        let bestMovesWeight;


        if (DIFFICULTY === 'easy') {
            bestMovesWeight = 1;
        }

        else if (DIFFICULTY === 'normal') {
            bestMovesWeight = 10;
        }
        else { // hard
            bestMovesWeight = 100;
        }
        let weightedMovesArray = weightedMove(bestMove, bestMovesWeight);
        bestMove = randomMove(weightedMovesArray);

        function randomMove(movesArr) {
            let resultMove = movesArr[Math.floor(Math.random() * movesArr.length)];
            return resultMove
        }

        function weightedMove(bestMove, num) {
            let wrongMove = randomMove(nextMoves);
            let arrMoves = [];
            for (let i = 0; i < num; i++) {
                arrMoves.push(bestMove);
            }
            arrMoves.push(wrongMove);
            return arrMoves;
        }

        return bestMove;
    };

    // game algorithm
    function minimax(depth, player) {
        let nextMoves = getValidMoves();

        let best = (player === seed) ? -1e100 : 1e100,
            current,
            bestidx = -1;

        if (nextMoves.length === 0 || depth === 0) {
            best = evaluate();
        } else {
            for (let i = nextMoves.length; i--;) {
                let m = nextMoves[i];
                data[m].set(player);

                if (player === seed) {
                    current = minimax(depth - 1, oppSeed)[0];
                    if (current > best) {
                        best = current;
                        bestidx = m;
                    }
                } else {
                    current = minimax(depth - 1, seed)[0];
                    if (current < best) {
                        best = current;
                        bestidx = m;
                    }
                }

                data[m].set(Tile.BLANK);
            }
        }

        return [best, bestidx, nextMoves];
    }
// gets a list of available tiles
    function getValidMoves() {
        let nm = [];
        if (hasWon(seed) || hasWon(oppSeed)) {
            return nm;
        }
        for (let i = data.length; i--;) {
            if (!data[i].hasData()) {
                nm.push(i);
            }
        }
        return nm;
    }
// returns tile score
    function evaluate() {
        let s = 0;
        s += evaluateLine(0, 1, 2);
        s += evaluateLine(3, 4, 5);
        s += evaluateLine(6, 7, 8);
        s += evaluateLine(0, 3, 6);
        s += evaluateLine(1, 4, 7);
        s += evaluateLine(2, 5, 8);
        s += evaluateLine(0, 4, 8);
        s += evaluateLine(2, 4, 6);
        return s;
    }

    // evaluates the line
    function evaluateLine(idx1, idx2, idx3) {
        let s = 0;

        if (data[idx1].equals(seed)) {
            s = 1;
        } else if (data[idx1].equals(oppSeed)) {
            s = -1;
        }

        if (data[idx2].equals(seed)) {
            if (s === 1) {
                s = 10;
            } else if (s === -1) {
                return 0;
            } else {
                s = 1;
            }
        } else if (data[idx2].equals(oppSeed)) {
            if (s === -1) {
                s = -10;
            } else if (s === 1) {
                return 0;
            } else {
                s = -1;
            }
        }

        if (data[idx3].equals(seed)) {
            if (s > 0) {
                s *= 10;
            } else if (s < 0) {
                return 0;
            } else {
                s = 1;
            }
        } else if (data[idx3].equals(oppSeed)) {
            if (s < 0) {
                s *= 10;
            } else if (s > 0) {
                return 0;
            } else {
                s = -1;
            }
        }

        return s;
    }

    let winnigPatterns = (function () {
        let wp = ["111000000", "000111000", "000000111",
                "100100100", "010010010", "001001001",
                "100010001", "001010100"],
            r = new Array(wp.length);
        for (let i = wp.length; i--;) {
            r[i] = parseInt(wp[i], 2);
        }
        return r;
    })();

    let hasWon = this.hasWon = function (player) {
        let p = 0;
        for (let i = data.length; i--;) {
            if (data[i].equals(player)) {
                p |= (1 << i);
            }
        }
        for (let i = winnigPatterns.length; i--;) {
            let wp = winnigPatterns[i];
            if ((p & wp) === wp) return true;
        }
        return false;
    };

    this.hasWinner = function () {
        if (hasWon(seed)) {
            return seed;
        }
        if (hasWon(oppSeed)) {
            return oppSeed;
        }
        return false;
    }
}


function MenuButton(text, x, y, cb) {
    let  callback = cb;
    let hover, normal, rect = {};
// When you press the mose it sends you to the chosen scene
    canvas.addEventListener("mousedown", function (evt) {
        if (state.active_name !== "menu") return;

        if (rect.hasPoint(mouse.x, mouse.y)) {
            if (callback) {
                callback();
            }
        }
    }, false);

//Style of the buttons
    (function () {
        let _c = document.createElement("canvas"),
            _w = _c.width = 340,
            _h = _c.height = 50,
            _lw = 2,
            s = 10;

        rect.x = x;
        rect.y = y;
        rect.width = _c.width;
        rect.height = _c.height;

        _w -= _lw;
        _h -= _lw;
        let _ctx = _c.getContext("2d");

        _ctx.fillStyle = "beige";
        _ctx.strokeStyle = "brown";
        _ctx.lineWidth = _lw;
        _ctx.font = "20px Helvetica";

        _ctx.translate(_lw / 2, _lw / 2);
        _ctx.beginPath();
        _ctx.arc(s, s, s, Math.PI, 1.5 * Math.PI);
        _ctx.arc(_w - s, s, s, 1.5 * Math.PI, 0);
        _ctx.arc(_w - s, _h - s, s, 0, 0.5 * Math.PI);
        _ctx.arc(s, _h - s, s, 0.5 * Math.PI, Math.PI);
        _ctx.closePath();
        _ctx.fill();
        _ctx.stroke();

        _ctx.fillStyle = _ctx.strokeStyle;
        let _txt = text;
        _ctx.fillText(_txt, (_w - _ctx.measureText(_txt).width) / 2, 30);

        normal = new Image();
        normal.src = _c.toDataURL();

        _ctx.fill();
        _ctx.stroke();

        _ctx.fillStyle = "white";
        _ctx.fillText(_txt, (_w - _ctx.measureText(_txt).width) / 2, 30);

        hover = new Image();
        hover.src = _c.toDataURL();
    })();

    rect.hasPoint = function (x, y) {
        let xl = this.x < x && x < this.x + this.width,
            yl = this.y < y && y < this.y + this.height;

        return xl && yl;
    };

    this.draw = function (ctx) {
        let tile = rect.hasPoint(mouse.x, mouse.y) && state.active_name === "menu" ? hover : normal;
        ctx.drawImage(tile, x, y);
    }

}
// Draws the playground
function Scene(width, height) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext("2d");

    this.getContext = function () {
        return ctx;
    };

    this.getCanvas = function () {
        return canvas;
    };

    this.draw = function (_ctx) {
        _ctx.drawImage(canvas, 0, 0);
    }
}