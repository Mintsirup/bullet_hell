import Bullet from "../../bullet.js";
import player from "../../player.js";

export default class AimPattern {

    constructor(boss){

        this.boss = boss;
        this.timer = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer > 1){

            this.timer = 0;

            const dx =
                player.x -
                this.boss.x;

            const dy =
                player.y -
                this.boss.y;

            const length =
                Math.hypot(
                    dx,
                    dy
                );

            spawned.push(

                new Bullet(

                    this.boss.x,
                    this.boss.y,

                    dx / length * 450,
                    dy / length * 450
                )
            );
        }

        return spawned;
    }
}