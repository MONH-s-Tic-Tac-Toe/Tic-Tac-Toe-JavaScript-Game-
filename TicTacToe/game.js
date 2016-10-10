function StateController() {

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
    }

    this.set = function (name) {
        active = state[name];
        this.active_name = name;
    }

    this.get = function (name) {
        return state[name];
    }

    this.change = function (name, _right) {
        anim = 0;
        right = _right || false;
        next = name;
        this.active_name = name;
    }

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
                for (let i = 0; i < c2w; i+= res){
                    ctx.drawImage(c2, i, 0, res, c2h,
                    i - (i - c2w)*p,
                    i*p*0.2,
                    res,c1h - i*p*0.4
                    );
                }

            } else{
                active = state[next];
                next = false;
                active.update();
                active.render(ctx);
            }
        } else{
            active.update();
            active.render(ctx);
        }
    }
}

function Segment(x, y) {

    let x = x, y = y;

    let segment = Segment.BLANK;
    let anim = 0;

    if (segment == null) {
        (function () {
                let _c = document.createElement("canvas");
                _c.width = _c.height = 100;
                let _ctx = _c.getContext("2d");

                _ctx.fillStyle = "skyblue";
                _ctx.lineWidth = 4;
                _ctx.strokeStyle = "white";
                _ctx.lineCap = "round";

                // Blank
                _ctx.fillRect(0, 0, 100, 100);
                Segment.BLANK = new Image();
                Segment.BLANK.src = _c.toDataURL();

                // Nought
                _ctx.fillRect(0, 0, 100, 100);

                _ctx.beginPath();
                _ctx.arc(50, 50, 30, 0, 2*Math.PI);
                _ctx.stroke();

                Segment.NOUGHT = new Image();
                Segment.NOUGHT.src = _c.toDataURL();

                // Cross
                _ctx.fillRect(0, 0, 100, 100);

                _ctx.beginPath();
                _ctx.moveTo(20, 20);
                _ctx.lineTo(80, 80);
                _ctx.moveTo(80, 20);
                _ctx.lineTo(20, 80);
                _ctx.stroke();

                Segment.CROSS = new Image();
                Segment.CROSS.src = _c.toDataURL();
            })();
        segment = Segment.BLANK;
    }

    this.active = function () {
        return anim > 0;
    };

    this.equals = function (_segment) {
        return segment === _segment;
    };

    this.hasData = function () {
        return segment !== Segment.BLANK;
    };

    this.set = function (next) {
        segment = next;
    };

    this.flip = function (next) {
        segment = next;
        anim = 1;
    };

    this.update = function() {
        if (anim > 0) {
            anim -= 0.02;
        }
    };

    this.draw = function (ctx) {
        if (anim <= 0) {
            ctx.drawImage(segment, x, y);
            return;
        }

        let res = 2;
        let t = anim > 0.5 ? Segment.BLANK : segment;
        let p = -Math.abs(2*anim - 1) + 1;

        p *= p;

        for (let i = 0; i < 100; i += res) {

            let j = 50 - (anim > 0.5 ? 100 - i : i);

            ctx.drawImage(t, i, 0, res, 100,
                    x + i - p*i + 50*p,
                    y - j*p*0.2,
                    res,
                    100 + j*p*0.4
            );
        }
    }
}
function AIPlayer(data) {

    let data = data, seed, oppSeed;

    this.setSeed = function(_seed) {
        seed = _seed;
        oppSeed = _seed === Segment.NOUGHT ? Segment.CROSS : Segment.NOUGHT;
    };

    this.getSeed = function() {
        return seed;
    };

    this.move = function() {
        return minimax(2, seed)[1];
    };

    function minimax(depth, player) {
        let nextMoves = getValidMoves();

        let best = (player === seed) ? -1e100 : 1e100,
            current,
            bestidx = -1;

        if (nextMoves.length === 0 || depth === 0) {
            best = evaluate();
        } else {
            for (let i = nextMoves.length;i--;) {
                let m = nextMoves[i];
                data[m].set(player);

                if (player === seed) {
                    current = minimax(depth-1, oppSeed)[0];
                    if (current > best) {
                        best = current;
                        bestidx = m;
                    }
                } else {
                    current = minimax(depth-1, seed)[0];
                    if (current < best) {
                        best = current;
                        bestidx = m;
                    }
                }

                data[m].set(Segment.BLANK);
            }
        }

        return [best, bestidx];
    }

    function getValidMoves() {
        let nm = [];
        if (hasWon(seed) || hasWon(oppSeed)) {
            return nm;
        }
        for (let i = data.length;i--;) {
            if (!data[i].hasData()) {
                nm.push(i);
            }
        }
        return nm;
    }

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

    let winingPatterns = (function() {
        let wp = ["111000000", "000111000", "000000111",
                "100100100", "010010010", "001001001",
                "100010001", "001010100"],
            r = new Array(wp.length);
        for (let i = wp.length;i--;) {
            r[i] = parseInt(wp[i], 2);
        }
        return r;
    })();

    let hasWon = this.hasWon = function(player) {
        let p = 0;
        for (let i = data.length;i--;) {
            if (data[i].equals(player)) {
                p |= (1 << i);
            }
        }
        for (let i = winingPatterns.length;i--;) {
            let wp = winingPatterns[i];
            if ((p & wp) === wp) return true;
        }
        return false;
    };

    this.hasWinner = function() {
        if (hasWon(seed)) {
            return seed;
        } if (hasWon(oppSeed)) {
            return oppSeed;
        }
        return false;
    }
}
