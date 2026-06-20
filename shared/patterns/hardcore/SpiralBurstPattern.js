import Bullet from "../../bullet.js";

export default class SpiralBurstPattern {

    constructor(boss){

        this.boss = boss;

        this.timer = 0;
        this.angle = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer >= 0.08){

            this.timer = 0;

            for(let i = 0; i < 4; i++){

                const angle =
                    this.angle +
                    i * Math.PI / 2;

                const bullet = new Bullet(

                    this.boss.x,
                    this.boss.y,

                    Math.cos(angle) * 320,
                    Math.sin(angle) * 320
                );

                spawned.push(
                    bullet
                );
            }

            this.angle += 0.18;
        }

        return spawned;
    }
}