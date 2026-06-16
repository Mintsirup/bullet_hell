import express from "express";
import cors from "cors";
import path from "path";
import { wss }
from "./socket.js";
import { fileURLToPath } from "url";

import verifyReplay from "./verifyReplay.js";

import {
    addScore,
    getLeaderboard
} from "./leaderboard.js";

const __filename =
    fileURLToPath(
        import.meta.url
    );

const __dirname =
    path.dirname(
        __filename
    );

const app =
    express();

app.use(cors());

function broadcastLeaderboard() {

    const data =
        JSON.stringify({

            type:
                "leaderboard",

            data:
                getLeaderboard()
        });

    wss.clients.forEach(
        client => {

            if (
                client.readyState === 1
            ) {

                client.send(data);
            }
        }
    );
}

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.static(
        path.join(
            __dirname,
            "../"
        )
    )
);

app.post(
    "/submitReplay",
    (req, res) => {

        try {

            const {
                seed,
                replayData,
                name
            } = req.body;

            const result =
                verifyReplay(
                    seed,
                    replayData
                );

            const added =
                addScore({

                    name,

                    score:
                        result.score,

                    rank:
                        result.rank,

                    replayHash:
                        result.replayHash,

                    seed,

                    replayData,

                    time:
                        Date.now()
                });
                broadcastLeaderboard();
            res.json({

                success: true,

                added,

                result
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                success: false
            });
        }
    }
);

app.get(
    "/replay/:id",
    (
        req,
        res
    ) => {

        const replay =

            getLeaderboard()
            .find(

                x =>
                x.id ===
                req.params.id
            );

        if (!replay) {

            return res
            .status(404)
            .json({
                error:
                    "not found"
            });
        }

        res.json({

            seed:
                replay.seed,

            replayData:
                replay.replayData
        });
    }
);

app.get(
    "/leaderboard",
    (req, res) => {

        res.json(
            getLeaderboard()
        );
    }
);

app.listen(
    23333,
    () => {

        console.log(
            "Server running on port 23333"
        );
    }
);