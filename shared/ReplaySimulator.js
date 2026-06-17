import RNG from "./RNG.js";

import Boss from "./boss.js";
import Player from "./player.js";

import Phase1 from "../client/phases/Phase1.js";
import Phase2 from "../client/phases/Phase2.js";
import Phase3 from "../client/phases/Phase3.js";
import Phase4 from "../client/phases/Phase4.js";

import {
    calculateScore
} from "./ScoreCalculator.js";

export default class ReplaySimulator {

    static run(
        seed,
        replayData
    ) {

        const rng =
            new RNG(seed);

        const canvas = {

            width: 1920,
            height: 1080
        };

        const keys = {};

        const bullets = [];

        const gameStats = {

            bulletsSpawned: 0,
            bulletsHit: 0,

            survivedTime: 0,

            phase4Time: 0
        };

        const player =
            new Player(
                canvas.width / 2,
                canvas.height / 2,
                keys,
                canvas,
                gameStats
            );

        const boss =
            new Boss(
                canvas.width / 2,
                100
            );

        let phase =
            new Phase1(
                boss
            );

        let replayIndex = 0;

        const FIXED_DELTA =
            1 / 60;

        for (
            let frame = 0;
            frame < 60 * 180;
            frame++
        ) {

            while (

                replayIndex <
                replayData.length &&

                replayData[
                    replayIndex
                ].frame <= frame
            ) {

                const event =

                    replayData[
                        replayIndex
                    ];

                keys[event.key] =

                    event.type ===
                    "down";

                replayIndex++;
            }

            boss.update(
                FIXED_DELTA
            );

            if (
                boss.phase === 2 &&
                !(phase instanceof Phase2)
            ) {

                phase =
                    new Phase2(
                        canvas,
                        boss,
                        rng
                    );
            }

            if (
                boss.phase === 3 &&
                !(phase instanceof Phase3)
            ) {

                phase =
                    new Phase3(
                        canvas,
                        boss,
                        rng
                    );
            }

            if (
                boss.phase === 4 &&
                !(phase instanceof Phase4)
            ) {

                phase =
                    new Phase4(
                        canvas,
                        boss,
                        rng
                    );
            }

            const spawned =
                phase.update(FIXED_DELTA);

                if (spawned.length > 50) {
                    console.log(
                        frame,
                        spawned.length
                    );
                }

            bullets.push(
                ...spawned
            );

            gameStats.bulletsSpawned +=
                spawned.length;

            gameStats.survivedTime +=
                FIXED_DELTA;

            if (
                boss.phase === 4
            ) {

                gameStats.phase4Time +=
                    FIXED_DELTA;
            }

            player.update(
                FIXED_DELTA
            );

            for (
                let i =
                    bullets.length - 1;
                i >= 0;
                i--
            ) {

                const bullet =
                    bullets[i];

                bullet.update(
                    FIXED_DELTA
                );

                if (
                    bullet.x < -50 ||
                    bullet.x >
                    canvas.width + 50 ||

                    bullet.y < -50 ||
                    bullet.y >
                    canvas.height + 50
                ) {

                    bullets.splice(
                        i,
                        1
                    );
                }
            }

            player.checkHits(
                bullets
            );

            if (
                player.hp <= 0
            ) {
                break;
            }

            if (
                gameStats.phase4Time >=
                180
            ) {
                break;
            }
        }

        const result =
            calculateScore(
                gameStats,
                player
            );

        return {

            ...result,

            survivedTime:
                gameStats.survivedTime,

            phase4Time:
                gameStats.phase4Time,

            bulletsSpawned:
                gameStats.bulletsSpawned,

            bulletsHit:
                gameStats.bulletsHit,

            bulletsDodged:
                gameStats.bulletsSpawned -
                gameStats.bulletsHit,

            hp:
                player.hp
        };

        console.log({
            hp: player.hp,
            survivedTime: gameStats.survivedTime,
            phase4Time: gameStats.phase4Time,
            bulletsSpawned: gameStats.bulletsSpawned,
            bossPhase: boss.phase
        });
    }
}