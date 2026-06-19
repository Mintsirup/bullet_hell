import ManyCirclePattern from "../../shared/patterns/ManyCirclePattern.js";
import SpinPattern from "../../shared/patterns/SpinPattern.js"

export default class Phase2 {

    constructor(boss) {

        this.patterns = [
            new ManyCirclePattern(boss),
            new SpinPattern(boss)
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