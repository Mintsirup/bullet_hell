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

        this.currentPatterns =
            this.getTwoRandomPatterns();
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

    getTwoRandomPatterns() {

        const patterns = [

            () => new CirclePattern(this.boss),

            () => new RainPattern(this.canvas, this.rng),

            () => new SpinPattern(this.boss),

            () => new WallPattern(this.canvas, this.rng)
        ];

        const index1 =
            Math.floor(
                this.rng.next() *
                patterns.length
            );

        let index2 =
            Math.floor(
                this.rng.next() *
                patterns.length
            );

        while (
            index2 === index1
        ) {

            index2 =
                Math.floor(
                    this.rng.next() *
                    patterns.length
                );
        }

        return [
        
            patterns[index1](),

            patterns[index2]()
        ];
    }

    update(deltaTime) {

        this.changeTimer +=
            deltaTime;

        if (
            this.changeTimer >= 5
        ) {

            this.changeTimer = 0;

            this.currentPatterns =
                this.getTwoRandomPatterns();
        }

        const bullets = [];

        for (
            const pattern
            of this.currentPatterns
        ) {

            bullets.push(
                ...pattern.update(
                    deltaTime
                )
            );
        }

        return bullets;
    }
}