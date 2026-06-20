export function getRank(score) {


if (score >= 1000000) return "S+";
if (score >= 900000) return "S";
if (score >= 800000) return "A";
if (score >= 650000) return "B";
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

const survivalRatio =
    Math.min(
        gameStats.survivedTime / 120,
        1
    );

const dodgeRatio =
    gameStats.bulletsSpawned > 0
        ? bulletsDodged /
          gameStats.bulletsSpawned
        : 0;

const survivalScore =
    survivalRatio * 700000;

const hpScore =
    (player.hp / player.maxHp)
    * 150000;

const dodgeScore =
    dodgeRatio * 150000;

let score =
    Math.floor(
        survivalScore +
        hpScore +
        dodgeScore
    );

const hardcore =

    sessionStorage.getItem(
        "hardcore"
    ) === "1";

let rank =
    getRank(score);

if(hardcore){

    rank =
        "HC-" + rank;
}

return {

    score,

    rank,

    bulletsDodged
};


}
