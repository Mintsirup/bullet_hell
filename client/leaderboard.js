let lastData = "";

async function loadLeaderboard() {

    const response =
        await fetch(
            `/api/leaderboard?mode=${currentMode}&t=${Date.now()}`
        );

    const data =
        await response.json();

    const json =
        JSON.stringify(data);

    if(json !== lastData){

        lastData = json;

        renderLeaderboard(data);
    }
}

let currentMode =
    "normal";

function renderLeaderboard(data) {

    const list =
        document.getElementById(
            "leaderboard"
        );

    list.innerHTML = "";

    data.forEach(
        (entry, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "entry";

            if (index === 0)
                row.classList.add(
                    "top1"
                );

            if (index === 1)
                row.classList.add(
                    "top2"
                );

            if (index === 2)
                row.classList.add(
                    "top3"
                );

            row.innerHTML =
            `
            <div class="rank">
                #${index + 1}
            </div>

            <div class="name">
                ${entry.name || "Anonymous"}
            </div>

            <div class="rankBadge">
                ${entry.rank}
            </div>

            <div class="score">
                ${entry.score}
            </div>

            <button
                class="watchBtn"
                data-id="${entry.id}">
                관전
            </button>
            `;

            const button =
                row.querySelector(
                    ".watchBtn"
                );

            button.addEventListener(
                "click",
                async () => {

                    const response =
                        await fetch(
                            `/api/replay/${entry.id}`
                        );

                    const replay =
                        await response.json();

                    sessionStorage.setItem(
                        "replayData",
                        JSON.stringify(
                            replay.replayData
                        )
                    );

                    sessionStorage.setItem(
                        "replaySeed",
                        replay.seed
                    );

                    sessionStorage.setItem(
                        "replayName",
                        entry.name
                    );

                    sessionStorage.setItem(
                        "replayScore",
                        entry.score
                    );

                    location.href =
                        "/game?replay=1";
                }
            );

            list.appendChild(
                row
            );

            const badge =
                row.querySelector(
                    ".rankBadge"
                );

            switch(entry.rank){

                case "S+":

                    badge.style.background =
                        "linear-gradient(135deg,#ff00ff,#00ffff)";

                    badge.style.color =
                        "#fff";

                    break;

                case "S":

                    badge.style.background =
                        "#ffd700";

                    badge.style.color =
                        "#000";

                    break;

                case "A":

                    badge.style.background =
                        "#00ffff";

                    badge.style.color =
                        "#000";

                    break;

                case "B":

                    badge.style.background =
                        "#66ff66";

                    badge.style.color =
                        "#000";

                    break;

                case "C":

                    badge.style.background =
                        "#ff9933";

                    badge.style.color =
                        "#000";

                    break;

                case "D":

                    badge.style.background =
                        "#888";

                    badge.style.color =
                        "#fff";

                    break;

                case "F":

                    badge.style.background =
                        "#ff4444";

                    badge.style.color =
                        "#fff";

                    break;
            }
        }
    );
}

document
.getElementById(
    "normalBtn"
)
.onclick = ()=>{

    currentMode =
        "normal";

    loadLeaderboard();
};

document
.getElementById(
    "hardcoreBtn"
)
.onclick = ()=>{

    currentMode =
        "hardcore";

    loadLeaderboard();
};

document
.getElementById(
    "backBtn"
)
.addEventListener(

    "click",

    ()=>{

        location.href =
            "/";
    }
);

loadLeaderboard();

setInterval(
    loadLeaderboard,
    5000
);