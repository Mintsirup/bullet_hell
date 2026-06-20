import Bullet from "../../bullet.js";

export default class CrossRainPattern {

    constructor(boss){

        this.boss = boss;
        this.timer = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer >= 0.15){

            this.timer = 0;

            const x =
                Math.random() * 1280;

            const y =
                Math.random() * 720;

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