import CirclePattern from "../../../shared/patterns/CirclePattern.js";

import boss from "../../../shared/boss.js"

export default class Phase1 {

    constructor(canvas, boss, rng) {

        this.phaseNumber = 1;

        this.canvas = canvas;
        this.boss = boss;
        this.rng = rng;

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