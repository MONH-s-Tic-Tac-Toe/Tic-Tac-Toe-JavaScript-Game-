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
    let segment = Segment.BLANK;
    let anim = 0;

    if (segment == null) {
        (function () {
            let canvas = document.createElement("canvas");
            canvas.width = canvas.height = 100;
            let ctx = canvas.getContext("2d");

            ctx.fillStyle = "skyblue";
            ctx.lineWidth = 4;
            ctx.strokeStyle = "white";
            ctx.lineCap = "round";

            // Blank
            ctx.fillRect(0, 0, 100, 100);
            Segment.BLANK = new Image();
            Segment.BLANK.src = canvas.toDataURL();

            // Nought
            ctx.fillRect(0, 0, 100, 100);

            ctx.beginPath();
            ctx.arc(50, 50, 30, 0, 2*Math.PI);
            ctx.stroke();

            Segment.NOUGHT = new Image();
            Segment.NOUGHT.src = canvas.toDataURL();

            // Cross
            ctx.fillRect(0, 0, 100, 100);

            ctx.beginPath();
            ctx.moveTo(20, 20);
            ctx.lineTo(80, 80);
            ctx.moveTo(80, 20);
            ctx.lineTo(20, 80);
            ctx.stroke();

            Segment.CROSS = new Image();
            Segment.CROSS.src = canvas.toDataURL();
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

// Creates the menu page
function MenuButtonController(text,x,y,callback) {
    let hover, normal, rect = {};

// Execute an action when pressing a mouse button over a paragraph
    canvas.addEventListener("mousedown", function(evt) {
        if (condition.active_name !== "menu") return;

        if (rect.hasPoint(mouse.x, mouse.y)) {
            if (callback) {
                callback();
            }
        }
    }, false);

// Creates a line in the menu page
    (function() {
        let canvas = document.createElement("canvas"),
            width = canvas.width = 340,
            height = canvas.height = 50,
            lineWidth = 2,
            coord = 10;

        rect.x = x;
        rect.y = y;
        rect.width = canvas.width;
        rect.height = canvas.height;

        width -= lineWidth;
        height -= lineWidth;

        let ctx = canvas.getContext("2d");

        ctx.fillStyle = "white";
        ctx.strokeStyle = "skyblue";
        ctx.lineWidth = lineWidth;
        ctx.font = "20px Helvetica";

        ctx.translate(lineWidth/2, lineWidth/2);
        ctx.beginPath();

// Creates the line by making it part by part
        ctx.arc(coord, coord, coord, Math.PI, 1.5*Math.PI);
        ctx.arc(width-coord, coord, coord, 1.5*Math.PI, 0);
        ctx.arc(width-coord, height-coord, coord, 0, 0.5*Math.PI);
        ctx.arc(coord, height-coord, coord, 0.5*Math.PI, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

// Defines the style of the rows
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillText(text, (width - ctx.measureText(text).width)/2, 30);

        normal = new Image();
        normal.src = canvas.toDataURL();

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.fillText(text, (width - ctx.measureText(text).width)/2, 30);

        hover = new Image();
        hover.src = canvas.toDataURL();
    })();

    rect.hasPoint = function(x, y) {
        let xl = this.x < x && x < this.x+this.width,
            yl = this.y < y && y < this.y+this.height;

        return xl && yl;
    };

    this.draw = function(ctx) {
        var tile = rect.hasPoint(mouse.x, mouse.y) && state.active_name==="menu"? hover : normal;
        ctx.drawImage(tile, x, y);
    }
}

//Creates the field of the game
function Scene(width,height) {
    let canvas = document.createElement("canvas");
    canvas.height = height;
    canvas.width = width;
    let ctx = canvas.getContext("2d");

    this.getContext = function () {
        return ctx;
    };
    this.getCanvas = function () {
        return canvas;
    };
    //draws the field
    this.draw = function (ctx) {
        ctx.drawImage(canvas, 0, 0);
    };
}
