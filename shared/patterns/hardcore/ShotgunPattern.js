import Bullet from "../../bullet.js";

export default class ShotgunPattern {

    constructor(boss, rng){

        this.boss = boss;
        this.rng = rng;
        this.timer = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer >= 0.6){

            this.timer = 0;

            const base =
                this.rng.next() *
                Math.PI * 2;

            for(let i = -6; i <= 6; i++){

                const angle =
                    base +
                    i * 0.12;

                spawned.push(

                    new Bullet(

                        this.boss.x,
                        this.boss.y,

                        Math.cos(angle) * 450,
                        Math.sin(angle) * 450
                    )
                );
            }
        }

        return spawned;
    }
}