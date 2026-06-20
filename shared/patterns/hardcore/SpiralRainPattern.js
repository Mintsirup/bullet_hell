import Bullet from "../../bullet.js";

export default class SpiralRainPattern {

    constructor(canvas) {

        this.canvas = canvas;

        this.timer = 0;

        this.angle = 0;
    }

    update(deltaTime) {

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer >= 0.03){

            this.timer = 0;

            const radius = 600;

            const x =
                this.canvas.width / 2 +
                Math.cos(this.angle) * radius;

            const y =
                this.canvas.height / 2 +
                Math.sin(this.angle) * radius;

            const dx =
                this.canvas.width / 2 - x;

            const dy =
                this.canvas.height / 2 - y;

            const len =
                Math.hypot(dx,dy);

            spawned.push(

                new Bullet(

                    x,
                    y,

                    dx / len * 320,
                    dy / len * 320
                )
            );

            this.angle += 0.15;
        }

        return spawned;
    }
}