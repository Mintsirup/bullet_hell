import CirclePattern from "../../../shared/patterns/CirclePattern.js";
import RainPattern from "../../../shared/patterns/RainPattern.js";
import SpinPattern from "../../../shared/patterns/SpinPattern.js";
import WallPattern from "../../../shared/patterns/WallPattern.js";

export default class Phase3 {

    constructor(canvas, boss, rng) {

        this.phaseNumber = 3;

        this.canvas = canvas;
        this.boss = boss;
        this.rng = rng;

        this.changeTimer = 0;

        this.currentPatterns =
            this.getRandomPatterns();
    }

    getRandomPatterns() {

        const roll =
            this.rng.next();

        // 25% 확률로 벽 단독

        if (roll < 0.25) {

            return [
                new WallPattern(
                    this.canvas,
                    this.rng
                )
            ];
        }

        const pool = [

            () => new CirclePattern(
                this.boss
            ),

            () => new RainPattern(
                this.canvas,
                this.rng
            ),

            () => new SpinPattern(
                this.boss
            )
        ];

        const shuffled =
            [...pool].sort(
                () => this.rng.next() - 0.5
            );

        return [

            shuffled[0](),
            shuffled[1]()
        ];
    }

    update(deltaTime) {

        this.changeTimer += deltaTime;

        if (this.changeTimer >= 5) {

            this.changeTimer = 0;

            this.currentPatterns =
                this.getRandomPatterns();
        }

        const bullets = [];

        for (
            const pattern of
            this.currentPatterns
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