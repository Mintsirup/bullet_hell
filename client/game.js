import Bullet from "../shared/bullet.js";
import Player from "../shared/player.js";
import Boss from "../shared/boss.js";
import RNG from "../shared/RNG.js";
import {drawPlayer} from "./playerRenderer.js"

import {calculateScore} from "../shared/ScoreCalculator.js";

// 패턴 불러오기
import Phase1 from "./phases/Phase1.js";
import Phase2 from "./phases/Phase2.js";
import Phase3 from "./phases/Phase3.js";
import Phase4 from "./phases/Phase4.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 키 입역 전역 관리
const keys = {};

const socket =
    new WebSocket(
        `ws://${location.hostname}:23334`
    );

const roomId =
    new URLSearchParams(
        location.search
    ).get("room");

const otherPlayers =
    new Map();

let myId = null;

socket.onopen =
() => {

    socket.send(
        JSON.stringify({

            type:
                "identify",

            playerId:
                sessionStorage.getItem(
                    "playerId"
                )
        })
    );
};

socket.onmessage =
event => {

    const data =
        JSON.parse(
            event.data
        );

    switch (
        data.type
    ) {

        case "connected":

            myId =
                data.playerId;

            break;

        case "roomFinished":

            sessionStorage.setItem(
                "roomResults",
                JSON.stringify(
                    data.results
                )
            );

            location.href =
                "roomResult.html";

            break;

        case "players":

            data.players.forEach(
                p => {

                    if (
                        p.id !==
                        myId
                    ) {

                        otherPlayers.set(
                            p.id,
                            p
                        );
                    }
                }
            );

            break;
    }
};

// 리플레이
const replayMode =
    new URLSearchParams(
        location.search
    ).get("replay") === "1";

const replayData = [];

const gameStats = {

    bulletsSpawned: 0,
    bulletsHit: 0,

    survivedTime: 0,

    phase4Time: 0
};

let frame = 0;

let seed;

if (replayMode) {

    seed = Number(
        sessionStorage.getItem(
            "replaySeed"
        )
    );

} else {

    seed = Math.floor(
        Math.random() * 2147483647
    );
}

const rng =
    new RNG(seed);

// 키 입력 상태 설정
if (!replayMode) {

    window.addEventListener(
        "keydown",
        e => {
        
            if (e.repeat) return;

            const key =
                e.key.toLowerCase();

            keys[key] = true;

            replayData.push({
                frame,
                type:
                    "down",
                key
            });
        }
    );

    window.addEventListener(
        "keyup",
        e => {

            const key =
                e.key.toLowerCase();

            keys[key] = false;

            replayData.push({
                frame,
                type:
                    "up",
                key
            });
        }
    );
}

let replayIndex = 0;

let replayInput = [];

if (replayMode) {

    try {

        replayInput =
            JSON.parse(
                sessionStorage.getItem(
                    "replayData"
                ) || "[]"
            );

    } catch {

        replayInput = [];
    }
}

const FIXED_DELTA = 1 / 60;

let accumulator = 0;

// 총알 전역 관리
const bullets = [];

// 캔버스 크기 설정
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const boss = new Boss(
    canvas.width / 2,
    100
);

let phase = new Phase1(boss);

let lastTime = 0;

let gameEnded = false;

const player = new Player(
    canvas.width / 2,
    canvas.height / 2,
    keys,
    canvas,
    gameStats
);

async function finishGame() {

    if (gameEnded) return;

    gameEnded = true;

    socket.send(
        JSON.stringify({

            type:
                "submitResult",

            roomId,

            name:
                sessionStorage.getItem(
                    "nickname"
                ),

            score:
                data.result.score,

            rank:
                data.result.rank
        })
    );

        if (replayMode) {

            sessionStorage.setItem(
                "result",
                JSON.stringify({

                    score: 0,
                    rank: "REPLAY",

                    survivedTime:
                        gameStats.survivedTime,

                    bulletsSpawned:
                        gameStats.bulletsSpawned,

                    bulletsHit:
                        gameStats.bulletsHit,

                    bulletsDodged:
                        gameStats.bulletsSpawned -
                        gameStats.bulletsHit
                })
            );

            location.href =
                "result.html";

            return;
        }

    if (!replayMode) {

        const response =
            await fetch(
                "/submitReplay",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        seed,
                        replayData,
                        name:
                            sessionStorage.getItem(
                                "nickname"
                            ) || "Anonymous"
                    })
                }
            );

        const data =
            await response.json();

        if (roomId) {

            socket.send(
                JSON.stringify({

                    type:
                        "submitResult",

                    roomId,

                    name:
                        sessionStorage.getItem(
                            "nickname"
                        ),

                    score:
                        data.result.score,

                    rank:
                        data.result.rank
                })
            );

            return;
        }

        location.href = "result.html";

        sessionStorage.setItem(
            "result",
            JSON.stringify(
                data.result
            )
        );

    }
}

// 게임 진행하는 부분
function updateGame(deltaTime) {

    if (gameEnded) return;

    frame++;

    if (replayMode) {

        while (
            replayIndex <
            replayInput.length &&

            replayInput[
                replayIndex
            ].frame <=
            frame
        ) {

            const event =
                replayInput[
                    replayIndex
                ];

            keys[event.key] =
                event.type ===
                "down";

            replayIndex++;
        }
    }

    boss.update(deltaTime);

    if (
        boss.phase === 2 &&
        !(phase instanceof Phase2)
    ) {
        phase = new Phase2(
            canvas,
            boss,
            rng
        );
    }

    if (
        boss.phase === 3 &&
        !(phase instanceof Phase3)
    ) {
        phase = new Phase3(
            canvas,
            boss,
            rng
        );
    }

    if (
        boss.phase === 4 &&
        !(phase instanceof Phase4)
    ) {
        phase = new Phase4(
            canvas,
            boss,
            rng
        );
    }

    const spawned =
        phase.update(deltaTime);

    bullets.push(...spawned);

    gameStats.bulletsSpawned +=
        spawned.length;

    gameStats.survivedTime +=
        deltaTime;

    if (boss.phase === 4) {

        gameStats.phase4Time +=
            deltaTime;
    }

    player.update(deltaTime);

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.update(deltaTime);

        if (
            bullet.x < -50 ||
            bullet.x > canvas.width + 50 ||
            bullet.y < -50 ||
            bullet.y > canvas.height + 50
        ) {
            bullets.splice(i, 1);
            continue;
        }
    }

    if (
        roomId &&
        socket.readyState ===
        WebSocket.OPEN
    ) {

        socket.send(
            JSON.stringify({

                type:
                    "playerUpdate",

                roomId,

                x:
                    player.x,

                y:
                    player.y,

                hp:
                    player.hp
            })
        );
    }

    console.log(
        "SOCKET STATE",
        socket.readyState
    );

    player.checkHits(
        bullets
    );

    if (
        player.hp <= 0
    ) {

        finishGame();
        return;
    }

    if (
        gameStats.phase4Time >=
        180
    ) {

        finishGame();
        return;
    }
}

function drawGame() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    boss.draw(ctx);

    drawPlayer(ctx, player);

    for (
        const bullet
        of bullets
    ) {

        bullet.draw(ctx);
    }

    for (
        const p of
        otherPlayers.values()
    ) {

        if (
            p.x == null ||
            p.y == null
        ) continue;

        ctx.fillStyle =
            "cyan";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            15,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "white";

        ctx.font =
            "16px Arial";

        ctx.fillText(
            p.name,
            p.x - 20,
            p.y - 25
        );
    }

    if (replayMode) {

        const replayName =
            sessionStorage.getItem(
                "replayName"
            ) || "Unknown";

        const replayScore =
            sessionStorage.getItem(
                "replayScore"
            ) || "0";

        ctx.fillStyle =
            "rgba(0,0,0,0.7)";

        ctx.fillRect(
            canvas.width - 350,
            10,
            330,
            100
        );

        ctx.strokeStyle =
            "yellow";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            canvas.width - 350,
            10,
            330,
            100
        );

        ctx.fillStyle =
            "yellow";

        ctx.font =
            "bold 26px Arial";

        ctx.fillText(
            "▶ REPLAY MODE",
            canvas.width - 335,
            40
        );

        ctx.fillStyle =
            "white";

        ctx.font =
            "20px Arial";

        ctx.fillText(
            `Player: ${replayName}`,
            canvas.width - 335,
            70
        );

        ctx.fillText(
            `Score: ${Number(
                replayScore
            ).toLocaleString()}`,
            canvas.width - 335,
            95
        );
    }

    if (boss.phase === 4) {

        ctx.fillStyle =
            "white";

        ctx.fillText(
            `Survive: ${
                Math.floor(
                    gameStats.phase4Time
                )
            } / 180`,
            20,
            120
        );
    }

    ctx.fillStyle =
        "white";

    ctx.font =
        "30px Arial";

    ctx.fillText(
        `HP: ${player.hp}`,
        20,
        40
    );

    ctx.fillText(
        `Phase ${boss.phase}`,
        20,
        80
    );
}

function loop(currentTime) {

    if (!lastTime) {

        lastTime =
            currentTime;

        requestAnimationFrame(
            loop
        );

        return;
    }

    const frameTime =

        (currentTime -
        lastTime) / 1000;

    lastTime =
        currentTime;

    accumulator +=
        frameTime;

    while (

        accumulator >=
        FIXED_DELTA
    ) {

        updateGame(
            FIXED_DELTA
        );

        accumulator -=
            FIXED_DELTA;
    }

    drawGame();

    requestAnimationFrame(
        loop
    );
}

requestAnimationFrame(loop);