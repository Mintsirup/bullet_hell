const socket =
    new WebSocket(
        `ws://${window.location.hostname}:23334`
    );

const roomId =
    sessionStorage.getItem(
        "roomId"
    );

const nickname =
    sessionStorage.getItem(
        "nickname"
    );

document
.getElementById(
    "roomCode"
)
.textContent =
    `ROOM : ${roomId}`;

socket.onopen =
() => {

    socket.send(
        JSON.stringify({

            type:
                "getRoom",

            roomId
        })
    );
};

socket.onmessage =
event => {

    const data =
        JSON.parse(
            event.data
        );

    console.log(
        "WS MESSAGE",
        data
    );

    switch (
        data.type
    ) {

        case "roomUpdate":

            renderPlayers(
                data.room
            );

            break;

        case "gameStart":

            console.log(
                "GAME START RECEIVED"
            );

            location.href =
                `game.html?room=${roomId}`;

            break;
    }
};

function renderPlayers(
    room
) {

    const list =
        document.getElementById(
            "playerList"
        );

    list.innerHTML =
        "";

    room.players.forEach(
        player => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "player";

            div.textContent =
                player.name;

            list.appendChild(
                div
            );
        }
    );
}

document
.getElementById(
    "startButton"
)
onclick =
() => {

    socket.send(
        JSON.stringify({

            type:
                "startRoom",

            roomId
        })
    );
};