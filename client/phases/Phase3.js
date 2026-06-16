import CirclePattern from "../../shared/patterns/CirclePattern.js";
import RainPattern from "../../shared/patterns/RainPattern.js";
import SpinPattern from "../../shared/patterns/SpinPattern.js";
import WallPattern from "../../shared/patterns/WallPattern.js";

export default class Phase3 {

    constructor(canvas, boss, rng) {

        this.canvas = canvas;
        this.boss = boss;
        this.rng = rng;

        this.changeTimer = 0;

        this.currentPattern =
            new CirclePattern(boss);
    }

    getRandomPattern() {

        const patterns = [
            () => new CirclePattern(this.boss),
            () => new RainPattern(this.canvas, this.rng),
            () => new SpinPattern(this.boss),
            () => new WallPattern(this.canvas, this.rng)
        ];

        const random =
            Math.floor(
                this.rng.next() *
                patterns.length
            );

        return patterns[random]();
    }

    update(deltaTime) {

        this.changeTimer += deltaTime;

        if (this.changeTimer >= 5) {

            this.changeTimer = 0;

            this.currentPattern =
                this.getRandomPattern();
        }

        return this.currentPattern.update(
            deltaTime
        );
    }
}