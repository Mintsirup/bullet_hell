import CirclePattern from "../patterns/CirclePattern.js";
import RainPattern from "../patterns/RainPattern.js";
import SpinPattern from "../patterns/SpinPattern.js";
import WallPattern from "../patterns/WallPattern.js";

export default class Phase3 {

    constructor(canvas, boss) {

        this.canvas = canvas;
        this.boss = boss;

        this.changeTimer = 0;

        this.currentPattern =
            new CirclePattern(boss);
    }

    getRandomPattern() {

        const patterns = [
            () => new CirclePattern(this.boss),
            () => new RainPattern(this.canvas),
            () => new SpinPattern(this.boss),
            () => new WallPattern(this.canvas)
        ];

        const random =
            Math.floor(
                Math.random() *
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

            console.log(
                "패턴 변경:",
                this.currentPattern.constructor.name
            );
        }

        return this.currentPattern.update(
            deltaTime
        );
    }
}