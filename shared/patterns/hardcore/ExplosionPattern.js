import Bullet from "../../bullet.js";

export default class ExplosionPattern {

    constructor(
        canvas,
        boss,
        rng
    ){

        this.canvas = canvas;
        this.rng = rng;

        this.timer = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer > 2){

            this.timer = 0;

            const x =
                this.rng.nextFloat() *
                this.canvas.width;

            const y =
                this.rng.nextFloat() *
                this.canvas.height;

            for(
                let i = 0;
                i < 24;
                i++
            ){

                const angle =
                    Math.PI * 2 *
                    i / 24;

                spawned.push(

                    new Bullet(

                        x,
                        y,

                        Math.cos(angle)*250,
                        Math.sin(angle)*250
                    )
                );
            }
        }

        return spawned;
    }
}