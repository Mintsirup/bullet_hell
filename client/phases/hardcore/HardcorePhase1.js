import SpiralBurstPattern from "../../../shared/patterns/hardcore/SpiralBurstPattern.js";

export default class HardcorePhase1 {

    constructor(canvas, boss, rng){

        this.phaseNumber = 1;

        this.patterns = [

            new SpiralBurstPattern(
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