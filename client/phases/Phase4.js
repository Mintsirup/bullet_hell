import RainPattern from "../../shared/patterns/RainPattern.js";
import CirclePattern from "../../shared/patterns/CirclePattern.js";
import SpinPattern from "../../shared/patterns/SpinPattern.js";

export default class Phase4 {

    constructor(canvas, boss, rng) {

        this.patterns = [
            new CirclePattern(boss),
            new SpinPattern(boss),
            new RainPattern(canvas, rng)
        ];
    }

    update(deltaTime) {

        const spawned = [];

        for (const pattern of this.patterns) {

            const bullets = pattern.update(deltaTime);

            console.log(
                pattern.constructor.name,
                bullets.length
            );

            spawned.push(...bullets);
        }

        return spawned;
    }
}