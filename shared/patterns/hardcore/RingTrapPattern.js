import Bullet from "../../bullet.js";

export default class RingTrapPattern {

    constructor(boss){

        this.boss = boss;
        this.timer = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer >= 2){

            this.timer = 0;

            const count = 48;

            for(let i = 0; i < count; i++){

                const angle =
                    (Math.PI * 2 * i)
                    / count;

                spawned.push(

                    new Bullet(

                        this.boss.x +
                        Math.cos(angle) * 250,

                        this.boss.y +
                        Math.sin(angle) * 250,

                        -Math.cos(angle) * 120,

                        -Math.sin(angle) * 120
                    )
                );
            }
        }

        return spawned;
    }
}