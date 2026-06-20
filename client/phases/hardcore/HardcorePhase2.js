import WallPattern from "../../../shared/patterns/hardcore/WallPattern.js";
import ReverseCirclePattern from "../../../shared/patterns/hardcore/ReverseCirclePattern.js";

export default class HardcorePhase2 {

    constructor(canvas, boss, rng){

        this.phaseNumber = 2;

        this.patterns = [

            new WallPattern(
                canvas
            ),

            new ReverseCirclePattern(
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