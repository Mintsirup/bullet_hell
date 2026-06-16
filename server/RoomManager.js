import crypto from "crypto";

export default class RoomManager {

    constructor() {

        this.rooms =
            new Map();
    }

    createRoom(
        hostId,
        hostName
    ) {

        const roomId =
            crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase();

        this.rooms.set(
            roomId,
            {

                id: roomId,

                hostId,

                started: false,

                players: [

                    {
                        id: hostId,
                        name: hostName
                    }
                ],

                results: []
            }
        );

        return roomId;
    }

    getRoom(
        roomId
    ) {

        return this.rooms.get(
            roomId
        );
    }

    joinRoom(
        roomId,
        playerId,
        playerName
    ) {

        const room =
            this.rooms.get(
                roomId
            );

        if (!room)
            return false;

        if (room.started)
            return false;

        room.players.push({

            id: playerId,
            name: playerName
        });

        return true;
    }

    addResult(
        roomId,
        result
    ) {

        const room =
            this.rooms.get(
                roomId
            );

        if (!room)
            return;

        room.results.push(
            result
        );

        room.results.sort(
            (a, b) =>
                b.score -
                a.score
        );
    }

    isFinished(
        roomId
    ) {

        const room =
            this.rooms.get(
                roomId
            );

        if (!room)
            return false;

        return (
            room.results.length ===
            room.players.length
        );
    }

    startRoom(
        roomId
    ) {

        console.log(
            "START ROOM CALLED",
            roomId
        );

        const room =
            this.rooms.get(
                roomId
            );

        if (!room)
            return false;

        room.started = true;

        return true;
    }

    deleteRoom(
        roomId
    ) {

        this.rooms.delete(
            roomId
        );
    }
}