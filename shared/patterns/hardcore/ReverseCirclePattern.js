import Bullet from "../../bullet.js";

export default class ReverseCirclePattern {

    constructor(boss){

        this.boss = boss;
        this.timer = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer >= 1){

            this.timer = 0;

            const count = 32;

            for(let i = 0; i < count; i++){

                const angle =
                    (Math.PI * 2 * i)
                    / count;

                const bullet =
                    new Bullet(

                        this.boss.x +
                        Math.cos(angle) * 400,

                        this.boss.y +
                        Math.sin(angle) * 400,

                        -Math.cos(angle) * 250,

                        -Math.sin(angle) * 250
                    );

                spawned.push(bullet);
            }
        }

        return spawned;
    }
}