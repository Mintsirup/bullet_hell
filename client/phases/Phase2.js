import CirclePattern from "../../shared/patterns/CirclePattern.js";
import RainPattern from "../../shared/patterns/RainPattern.js";

export default class Phase2 {

    constructor(canvas, boss, rng) {

        this.patterns = [
            new CirclePattern(boss),
            new RainPattern(canvas, rng)
        ];
    }

    update(deltaTime) {

        const spawned = [];

        for (const pattern of this.patterns) {

            const bullets = pattern.update(deltaTime);

            spawned.push(...bullets);
        }

        return spawned;
    }
}