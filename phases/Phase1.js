import CirclePattern from "../patterns/CirclePattern.js";
import WallPattern from "../patterns/WallPattern.js";

import boss from "../boss.js"

export default class Phase1 {

    constructor(canvas, boss) {

        this.patterns = [
            new WallPattern(canvas),
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