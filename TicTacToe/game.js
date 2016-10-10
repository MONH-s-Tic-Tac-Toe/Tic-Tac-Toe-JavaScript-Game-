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
