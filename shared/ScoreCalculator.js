export function getRank(score) {

    if (score >= 1000000) return "S+";
    if (score >= 900000) return "S";
    if (score >= 800000) return "A";
    if (score >= 650000) return "B";
    if (score >= 500000) return "C";
    if (score >= 300000) return "D";

    return "F";
}

// mode: "normal" | "hardcore" | undefined
// 클라이언트에서는 mode를 생략하면 sessionStorage로 판단 (기존 동작 유지)
// 서버에서는 mode를 직접 전달
export function calculateScore(gameStats, player, mode) {

    const bulletsDodged =
        gameStats.bulletsSpawned -
        gameStats.bulletsHit;

    const survivalRatio =
        Math.min(gameStats.survivedTime / 120, 1);

    const dodgeRatio =
        gameStats.bulletsSpawned > 0
            ? bulletsDodged / gameStats.bulletsSpawned
            : 0;

    const survivalScore = survivalRatio * 700000;
    const hpScore = (player.hp / player.maxHp) * 150000;
    const dodgeScore = dodgeRatio * 150000;

    const score = Math.floor(survivalScore + hpScore + dodgeScore);

    // mode 인자가 없으면 클라이언트 환경으로 간주해 sessionStorage 사용
    let hardcore;
    if (mode !== undefined) {
        hardcore = mode === "hardcore";
    } else {
        hardcore = typeof sessionStorage !== "undefined" &&
            sessionStorage.getItem("hardcore") === "1";
    }

    let rank = getRank(score);
    if (hardcore) rank = "HC-" + rank;

    return { score, rank, bulletsDodged };
}
