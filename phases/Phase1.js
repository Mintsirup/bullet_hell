import CirclePattern from "../patterns/CirclePattern.js";

import boss from "../boss.js"

export default class Phase1 {

    constructor(boss) {

        this.patterns = [
            new CirclePattern(boss)
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