import CirclePattern from "../patterns/CirclePattern.js";
import RainPattern from "../patterns/RainPattern.js";

export default class Phase2 {

    constructor(canvas, boss) {

        this.patterns = [
            new CirclePattern(boss),
            new RainPattern(canvas)
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