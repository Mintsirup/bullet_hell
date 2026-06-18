const achievementNames = {

    first_play:
        "🎮 첫 플레이",

    first_clear:
        "🏆 첫 클리어",

    rank_c:
        "🥉 C랭크",

    rank_b:
        "🥈 B랭크",

    rank_a:
        "🥇 A랭크",

    rank_s:
        "💎 S랭크",

    rank_s_plus:
        "👑 S+랭크",

    score_300k:
        "300K 점수",

    score_500k:
        "500K 점수",

    score_800k:
        "800K 점수",

    million_score:
        "💰 백만점",

    survivor_30:
        "30초 생존",

    survivor_60:
        "60초 생존",

    survivor_120:
        "120초 생존",

    full_hp_clear:
        "❤️ 노데미지",

    phase4_reached:
        "⚔️ Phase4 도달",

    phase4_master:
        "🔥 Phase4 정복",

    replay_uploaded:
        "📼 리플레이 등록"
};

async function loadProfile(){

    const username =
        localStorage.getItem(
            "username"
        );

    if(!username){

        location.href =
            "/login";

        return;
    }

    const response =
        await fetch(
            `/api/profile/${username}`
        );

    if(!response.ok){

        alert(
            "프로필을 불러올 수 없음"
        );

        return;
    }

    const data =
        await response.json();

    document
    .getElementById(
        "username"
    )
    .textContent =
        `닉네임: ${data.username}`;

    document
    .getElementById(
        "highestScore"
    )
    .textContent =
        `최고 점수: ${data.stats.highestScore}`;

    document
    .getElementById(
        "highestRank"
    )
    .textContent =
        `최고 랭크: ${data.stats.highestRank}`;

    document
    .getElementById(
        "gamesPlayed"
    )
    .textContent =
        `플레이 횟수: ${data.stats.gamesPlayed}`;

    document
    .getElementById(
        "totalDodged"
    )
    .textContent =
        `총 회피 수: ${data.stats.totalBulletsDodged}`;

    document
    .getElementById(
        "totalSurvival"
    )
    .textContent =
        `총 생존 시간: ${Math.floor(data.stats.totalSurvivalTime)}초`;

    const list =
        document.getElementById(
            "achievements"
        );

    list.innerHTML = "";

    data.achievements.forEach(
        achievement => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "achievement";

            div.textContent =
                "✓ " +
                (
                    achievementNames[
                        achievement
                    ]
                    ||
                    achievement
                );

            list.appendChild(
                div
            );
        }
    );
}

loadProfile();