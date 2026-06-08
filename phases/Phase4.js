import RainPattern from "../patterns/RainPattern.js";
import CirclePattern from "../patterns/CirclePattern.js";

export default class Phase4 {

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

            console.log(
                pattern.constructor.name,
                bullets.length
            );

            spawned.push(...bullets);
        }

        return spawned;
    }
}