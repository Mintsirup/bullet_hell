import Phase1 from "../client/phases/normal/Phase1.js";
import Phase2 from "../client/phases/normal/Phase2.js";
import Phase3 from "../client/phases/normal/Phase3.js";
import Phase4 from "../client/phases/normal/Phase4.js";

import HardcorePhase1 from "../client/phases/hardcore/HardcorePhase1.js";
import HardcorePhase2 from "../client/phases/hardcore/HardcorePhase2.js";
import HardcorePhase3 from "../client/phases/hardcore/HardcorePhase3.js";
import HardcorePhase4 from "../client/phases/hardcore/HardcorePhase4.js";

export default function getPhase(

    phaseNumber,

    boss,

    canvas,

    rng
){

    const hardcore =

        sessionStorage.getItem(
            "hardcore"
        ) === "1";

    const phaseMap = hardcore

        ? {

            1: HardcorePhase1,
            2: HardcorePhase2,
            3: HardcorePhase3,
            4: HardcorePhase4
        }

        : {

            1: Phase1,
            2: Phase2,
            3: Phase3,
            4: Phase4
        };

    const PhaseClass =
        phaseMap[
            phaseNumber
        ];

    if(
        !PhaseClass
    ){

        console.error(
            "Unknown phase",
            phaseNumber
        );

        return null;
    }

    return new PhaseClass(

        canvas,

        boss,

        rng
    );
}