async function loadLeaderboard() {


if (!window.leaderboardSocket) {

    window.leaderboardSocket =
        new WebSocket(
            `ws://${window.location.hostname}:23334`
        );

    window.leaderboardSocket.onmessage =
        event => {

            const message =
                JSON.parse(
                    event.data
                );

            if (
                message.type ===
                "leaderboard"
            ) {

                renderLeaderboard(
                    message.data
                );
            }
        };

    window.leaderboardSocket.onerror =
        err => {

            console.error(
                "Leaderboard WebSocket Error",
                err
            );
        };
}

const response =
    await fetch(
        "/leaderboard"
    );

const data =
    await response.json();

renderLeaderboard(
    data
);
```

}

function renderLeaderboard(data) {

```
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

        <div class="score">
            ${Number(
                entry.score || 0
            ).toLocaleString()}
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

                try {

                    const response =
                        await fetch(
                            `/replay/${entry.id}`
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
                        "game.html?replay=1";

                } catch (err) {

                    console.error(
                        err
                    );

                    alert(
                        "리플레이를 불러오지 못했습니다."
                    );
                }
            }
        );

        list.appendChild(
            row
        );
    }
);


}

loadLeaderboard();
