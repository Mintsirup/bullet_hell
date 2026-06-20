import AimPattern from "../../../shared/patterns/hardcore/AimPattern.js";
import SpiralRainPattern from "../../../shared/patterns/hardcore/SpiralRainPattern.js";
import ExplosionPattern from "../../../shared/patterns/hardcore/ExplosionPattern.js";

export default class HardcorePhase4 {

    constructor(canvas, boss, rng){

        this.phaseNumber = 4;

        this.patterns = [

            new AimPattern(
                boss
            ),

            new SpiralRainPattern(
                canvas
            ),

            new ExplosionPattern(
                canvas,
                boss,
                rng
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