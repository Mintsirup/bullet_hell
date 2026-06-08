import Bullet from "../bullet.js";

export default class RainPattern {

    constructor(canvas) {
        this.canvas = canvas;
        this.timer = 0;
    }

    update(deltaTime) {

        this.timer += deltaTime;

        const spawned = [];

        if (this.timer > 0.5) {

            this.timer = 0;

            for (let i = 0; i < 5; i++) {
                spawned.push(
                    new Bullet(
                        Math.random() * this.canvas.width,
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