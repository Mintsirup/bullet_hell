import CirclePattern from "../patterns/CirclePattern.js";
import SpinPattern from "../patterns/SpinPattern.js";

export default class Phase1 {

    constructor(boss) {

        this.patterns = [
            new SpinPattern(boss)
        ];
    }

    update(deltaTime) {

        const spawned = [];

        for (const pattern of this.patterns) {

            spawned.push(
                ...pattern.update(deltaTime)
            );
        }

        return spawned;
    }
}