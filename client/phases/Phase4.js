import CirclePattern from "../../shared/patterns/CirclePattern.js";
import SpinPattern from "../../shared/patterns/SpinPattern.js";

export default class Phase4 {

    constructor(boss) {

        console.log(boss);
        
        this.patterns = [
            new CirclePattern(boss),
            new SpinPattern(boss)
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