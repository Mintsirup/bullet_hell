import CrossRainPattern from "../../../shared/patterns/hardcore/CrossRainPattern.js";
import RingTrapPattern from "../../../shared/patterns/hardcore/RingTrapPattern.js";

export default class HardcorePhase3 {

    constructor(canvas, boss, rng){

        this.phaseNumber = 3;

        this.patterns = [

            new CrossRainPattern(
                boss,
                rng
            ),

            new RingTrapPattern(
                boss
            )
        ];
    }

    update(deltaTime){

        const spawned = [];

        for(const pattern of this.patterns){

            spawned.push(
                ...pattern.update(deltaTime)
            );
        }

        return spawned;
    }
}