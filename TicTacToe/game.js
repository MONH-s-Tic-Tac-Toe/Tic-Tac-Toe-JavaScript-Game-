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