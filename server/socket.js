import { WebSocketServer }
from "ws";

import crypto
from "crypto";

import RoomManager
from "./RoomManager.js";

const rooms =
    new RoomManager();

const clients =
    new Map();

export const wss =
    new WebSocketServer({
        host: "0.0.0.0",
        port: 23334
    });

function send(
    ws,
    data
) {

    ws.send(
        JSON.stringify(
            data
        )
    );
}

setInterval(
    () => {

        for (
            const room of
            rooms.rooms.values()
        ) {

            const payload =
                JSON.stringify({

                    type:
                        "players",

                    players:
                        room.players
                });

            room.players.forEach(
                player => {

                    const ws =
                        clients.get(
                            player.id
                        );

                    if (
                        ws &&
                        ws.readyState === 1
                    ) {

                        ws.send(
                            payload
                        );
                    }
                }
            );
        }

    },
    50
);

function broadcastRoom(
    roomId
) {

    const room =
        rooms.getRoom(
            roomId
        );

    if (!room)
        return;

    room.players.forEach(
        player => {

            const ws =
                clients.get(
                    player.id
                );

            if (!ws)
                return;

            send(
                ws,
                {
                    type:
                        "roomUpdate",

                    room
                }
            );
        }
    );
}

wss.on(
    "connection",
    ws => {

        const playerId =
            crypto.randomUUID();

        clients.set(
            playerId,
            ws
        );

        send(
            ws,
            {
                type:
                    "connected",

                playerId
            }
        );

        ws.on(
            "message",
            raw => {

                const data =
                    JSON.parse(
                        raw
                    );

                switch (
                    data.type
                ) {

                    case "playerUpdate": {

                        const room =
                            rooms.getRoom(
                                data.roomId
                            );

                        if (!room)
                            break;

                        const player =
                            room.players.find(
                                p =>
                                p.id === playerId
                            );

                        if (player) {

                            player.x =
                                data.x;

                            player.y =
                                data.y;

                            player.hp =
                                data.hp;
                        }

                        break;
                    }

                    case
                    "createRoom": {

                        const roomId =

                            rooms.createRoom(
                                playerId,
                                data.name
                            );

                        send(
                            ws,
                            {
                                type:
                                    "roomCreated",

                                roomId
                            }
                        );

                        broadcastRoom(
                            roomId
                        );

                        console.log(
                            "ROOM CREATED",
                            roomId
                        );

                        break;
                    }

                    case
                    "joinRoom": {

                        console.log(
                            "JOIN",
                            data.roomId,
                            data.name
                        );

                        const room =
                            rooms.getRoom(
                                data.roomId
                            );

                        console.log(
                            "ROOM EXISTS?",
                            !!room
                        );

                        if (room) {

                            console.log(
                                room
                            );
                        }

                        const ok =
                            rooms.joinRoom(
                                data.roomId,
                                playerId,
                                data.name
                            );

                        
                        console.log(
                            "JOIN RESULT",
                            ok
                        );

                        send(
                            ws,
                            {
                                type:
                                    "joinResult",

                                success:
                                    ok
                            }
                        );

                        if (ok) {

                            broadcastRoom(
                                data.roomId
                            );
                        }

                        break;
                    }

                    case
                    "startRoom": {

                        rooms.startRoom(
                            data.roomId
                        );

                        const room =

                            rooms.getRoom(
                                data.roomId
                            );

                        if (
                            room.players.length < 2
                        ) {

                            send(
                                ws,
                                {
                                    type:
                                        "error",

                                    message:
                                        "최소 2명 필요"
                                }
                            );

                            break;
                        }

                        rooms.startRoom(
                            data.roomId
                        );

                        room.players.forEach(
                            player => {

                                console.log(
                                    "SEND GAMESTART TO",
                                    player.id
                                );

                                const client =

                                    clients.get(
                                        player.id
                                    );

                                if (!client)
                                    return;

                                send(
                                    client,
                                    {
                                        type:
                                            "gameStart",

                                        roomId:
                                            room.id
                                    }
                                );
                            }

                        );

                        console.log(
                            "START ROOM",
                            roomId,
                            room.started
                        );

                        break;
                    }

                    case "getRoom": {

                        const room =
                            rooms.getRoom(
                                data.roomId
                            );

                        send(
                            ws,
                            {
                                type:
                                    "roomUpdate",

                                room
                            }
                        );

                        break;
                    }

                    case
                    "submitResult": {

                        rooms.addResult(
                            data.roomId,
                            {
                                name:
                                    data.name,

                                score:
                                    data.score,

                                rank:
                                    data.rank
                            }
                        );

                        if (
                            rooms.isFinished(
                                data.roomId
                            )
                        ) {

                            const room =

                                rooms.getRoom(
                                    data.roomId
                                );

                            room.players.forEach(
                                player => {

                                    const client =

                                        clients.get(
                                            player.id
                                        );

                                    if (!client)
                                        return;

                                    send(
                                        client,
                                        {
                                            type:
                                                "roomFinished",

                                            results:
                                                room.results
                                        }
                                    );
                                }
                            );
                        }

                        break;
                    }
                }
            }
        );

        ws.on(
            "close",
            () => {

                clients.delete(
                    playerId
                );
            }
        );
    }
);

console.log(
    "WebSocket server running on 23334"
);