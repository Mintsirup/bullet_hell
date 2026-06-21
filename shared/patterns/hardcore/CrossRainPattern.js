import Bullet from "../../bullet.js";

export default class CrossRainPattern {

    constructor(boss, rng){

        this.boss = boss;
        this.rng = rng;
        this.timer = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer >= 0.15){

            this.timer = 0;

            const x =
                this.rng.next() * 1280;

            const y =
                this.rng.next() * 720;

            spawned.push(

                new Bullet(
                    x,
                    -20,
                    0,
                    350
                )
            );

            spawned.push(

                new Bullet(
                    -20,
                    y,
                    350,
                    0
                )
            );
        }

        return spawned;
    }
}