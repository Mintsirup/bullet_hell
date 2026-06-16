async function loadLeaderboard() {

    const response =
        await fetch(
            "/leaderboard"
        );

    const socket =
        new WebSocket(
            "ws://${window.location.hostname}:23334"
        );

    socket.onmessage =
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

    const data =
        await response.json();

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

            button.addEventListener("click",
                async () => {

                    const response = await fetch(`/replay/${entry.id}`);

                    const replay = await response.json();

                    sessionStorage.setItem("replayData", JSON.stringify(replay.replayData));

                    sessionStorage.setItem("replaySeed", replay.seed);

                    sessionStorage.setItem("replayName", entry.name);

                    sessionStorage.setItem("replayScore", entry.score);

                    location.href = "game.html?replay=1";
                }
            );

            list.appendChild(
                row
            );
        }
    );
}

loadLeaderboard();