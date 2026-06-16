import crypto from "crypto";
import ReplaySimulator from "../shared/ReplaySimulator.js";

export default function verifyReplay(
    seed,
    replayData
) {

    const result =
        ReplaySimulator.run(
            seed,
            replayData
        );

    result.replayHash =
        crypto
            .createHash("sha256")
            .update(
                JSON.stringify({
                    seed,
                    replayData
                })
            )
            .digest("hex");

    return result;
}