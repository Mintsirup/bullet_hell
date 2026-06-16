import Bullet from "../bullet.js";

export default class RainPattern {

    constructor(canvas, rng) {

        this.canvas = canvas;
        this.rng = rng;

        this.timer = 0;
    }

    update(deltaTime) {

        this.timer += deltaTime;

        const spawned = [];

        if (this.timer > 0.5) {

            this.timer = 0;

            for (let i = 0; i < 5; i++) {

                const x =
                    this.rng.next() *
                    this.canvas.width;

                spawned.push(
                    new Bullet(
                        x,
                        -20,
                        0,
                        240
                    )
                );
            }
        }
        return spawned;
    }
}