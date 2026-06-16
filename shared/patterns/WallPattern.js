import Bullet from "../bullet.js";

export default class WallPattern {

    constructor(canvas, rng) {

        this.canvas = canvas;
        this.rng = rng;

        this.timer = 0;
    }

    update(deltaTime) {
        this.timer += deltaTime;

        const spawned = [];

        if (this.timer >= 2) {

            this.timer = 0;

            const columns = 500;

            const gapSize = 20;

            const gap =
                Math.floor(
                    this.rng.next() * columns
                );

            const spacing =
                this.canvas.width / columns;

            for (let i = 0; i < columns; i++) {

                if (
                    i >= gap &&
                    i < gap + gapSize
                ) {
                    continue;
                }

                spawned.push(
                    new Bullet(
                        i * spacing + spacing / 2,
                        -20,
                        0,
                        180
                    )
                );
            }
        }

        return spawned;
    }
}