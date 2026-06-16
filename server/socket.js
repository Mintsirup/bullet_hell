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

const wss =
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
                                            "gameStart",

                                        roomId:
                                            room.id
                                    }
                                );
                            }
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