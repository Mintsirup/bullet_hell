import fs from "fs";
import crypto from "crypto";

import path from "path";
import { fileURLToPath } from "url";

const __filename =
    fileURLToPath(
        import.meta.url
    );

const __dirname =
    path.dirname(
        __filename
    );

const FILE =
    path.join(
        __dirname,
        "data",
        "leaderboard.json"
    );

const REPLAY_DIR =
    path.join(
        __dirname,
        "data",
        "replays"
    );

if (
    !fs.existsSync(
        REPLAY_DIR
    )
) {

    fs.mkdirSync(
        REPLAY_DIR,
        {
            recursive: true
        }
    );
}

let leaderboard = [];

const replayHashes =
    new Set();

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
        !entry.replayHash
    )
    {
        return false;
    }

    if (
        replayHashes.has(
            entry.replayHash
        )
    ) {

        return false;
    }

    const id =
        crypto.randomUUID();

    fs.writeFileSync(

        path.join(
            REPLAY_DIR,
            `${id}.json`
        ),

        JSON.stringify({

            seed:
                entry.seed,

            replayData:
                entry.replayData
        })
    );

    replayHashes.add(
        entry.replayHash
    );

    leaderboard.push({

        id,

        name:
            entry.name,

        score:
            entry.score,

        rank:
            entry.rank,

        time:
            Date.now()
    });

    leaderboard.sort(
        (a, b) =>
            b.score - a.score
    );

    save();

    return true;
}

leaderboard.forEach(
    entry => {

        if (
            entry.replayHash
        ) {

            replayHashes.add(
                entry.replayHash
            );
        }
    }
);

export function getLeaderboard() {

    return leaderboard;
}