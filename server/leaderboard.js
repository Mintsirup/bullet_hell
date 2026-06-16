import fs from "fs";
import crypto from "crypto";

const FILE =
    "./leaderboard.json";

let leaderboard = [];

try {

    if (
        fs.existsSync(FILE)
    ) {

        leaderboard =
            JSON.parse(
                fs.readFileSync(
                    FILE,
                    "utf8"
                )
            );
    }

} catch (err) {

    console.error(
        "리더보드 로드 실패",
        err
    );

    leaderboard = [];
}

function save() {

    fs.writeFileSync(
        FILE,
        JSON.stringify(
            leaderboard,
            null,
            4
        )
    );
}

export function addScore(
    entry
) {

    if (
        replayHashes.has(
            entry.replayHash
        )
    ) {

        return false;
    }

    entry.id =
        crypto.randomUUID();

    replayHashes.add(
        entry.replayHash
    );

    leaderboard.push(
        entry
    );

    leaderboard.sort(
        (a, b) =>
            b.score - a.score
    );

    save();

    return true;
}

const replayHashes =
    new Set();

export function getLeaderboard() {

    return leaderboard;
}