import CirclePattern from "../../../shared/patterns/CirclePattern.js";
import SpinPattern from "../../../shared/patterns/SpinPattern.js";

export default class Phase4 {

    constructor(canvas, boss, rng) {

        this.phaseNumber = 4;

        this.canvas = canvas;
        this.boss = boss;
        this.rng = rng;
        
        this.patterns = [
            new CirclePattern(boss),
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