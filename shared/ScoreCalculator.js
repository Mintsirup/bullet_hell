export function getRank(score) {

    if (score === 1000000) return "S+";
    if (score >= 950000) return "S";
    if (score >= 850000) return "A";
    if (score >= 700000) return "B";
    if (score >= 500000) return "C";
    if (score >= 300000) return "D";

    return "F";
}

export function calculateScore(
    gameStats,
    player
) {

    const bulletsDodged =
        gameStats.bulletsSpawned -
        gameStats.bulletsHit;

    const survivalScore =
        Math.min(
            gameStats.survivedTime / 180,
            1
        ) * 400000;

    const dodgeRate =
        gameStats.bulletsSpawned > 0
            ? bulletsDodged /
              gameStats.bulletsSpawned
            : 0;

    const dodgeScore =
        dodgeRate * 300000;

    const hpScore =
        (player.hp / player.maxHp)
        * 300000;

    const score =
        Math.floor(
            survivalScore +
            dodgeScore +
            hpScore
        );

    return {

        score,

        rank:
            getRank(score),

        bulletsDodged
    };
}