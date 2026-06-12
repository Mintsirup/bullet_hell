import Bullet from "./bullet.js";
import Player from "./player.js";
import Boss from "./boss.js";

// 패턴 불러오기
import Phase1 from "./phases/Phase1.js";
import Phase2 from "./phases/Phase2.js";
import Phase3 from "./phases/Phase3.js";
import Phase4 from "./phases/Phase4.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 키 입역 전역 관리
const keys = {};

function bindMobileButton(
    buttonId,
    key
) {

    const button =
        document.getElementById(buttonId);

    if (!button) return;

    button.addEventListener(
        "touchstart",
        e => {
            e.preventDefault();
            keys[key] = true;
        }
    );

    button.addEventListener(
        "touchend",
        e => {
            e.preventDefault();
            keys[key] = false;
        }
    );

    button.addEventListener(
        "mousedown",
        () => {
            keys[key] = true;
        }
    );

    button.addEventListener(
        "mouseup",
        () => {
            keys[key] = false;
        }
    );
}

bindMobileButton("up", "w");
bindMobileButton("left", "a");
bindMobileButton("down", "s");
bindMobileButton("right", "d");

// 키 입력 상태 설정
window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

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

const player = new Player(
    canvas.width / 2,
    canvas.height / 2,
    keys,
    canvas
);

let lastTime = 0;

// 게임 진행하는 부분
function loop(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const deltaTime =
        (currentTime - lastTime) / 1000;

    lastTime = currentTime;

    boss.update(deltaTime);
    boss.draw(ctx);

    if (
        boss.phase === 2 &&
        !(phase instanceof Phase2)
    ) {
        phase = new Phase2(canvas, boss);
    }

    if (
        boss.phase === 3 &&
        !(phase instanceof Phase3)
    ) {
        phase = new Phase3(canvas, boss);
    }

    if (
        boss.phase === 4 &&
        !(phase instanceof Phase4)
    ) {
        phase = new Phase4(canvas, boss);
    }

    const spawned =
        phase.update(deltaTime);

    bullets.push(...spawned);

    player.update(deltaTime);
    player.draw(ctx);

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.update(deltaTime);
        bullet.draw(ctx);
    }

    player.checkHits(bullets);

    if (player.hp <= 0) {
        alert("게입 오버!")
        location.href = "index.html";
    }

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(`HP: ${player.hp}`, 20, 40);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";

    ctx.fillText(
        `Phase ${boss.phase}`,
        20,
        80
    );

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);