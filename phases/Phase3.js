import SpinPattern from "../patterns/SpinPattern.js";
import RainPattern from "../patterns/RainPattern.js";

export default class Phase3 {

    constructor(canvas, boss) {

        this.patterns = [
            new SpinPattern(boss),
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