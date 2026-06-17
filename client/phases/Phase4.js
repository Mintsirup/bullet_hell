import CirclePattern from "../../shared/patterns/ManyCirclePattern.js";

export default class Phase4 {

    constructor(boss) {

        this.patterns = [
            new ManyCirclePattern(boss)
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