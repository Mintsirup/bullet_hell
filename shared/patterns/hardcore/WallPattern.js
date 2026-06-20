import Bullet from "../../bullet.js";

export default class WallPattern {

    constructor(canvas){

        this.canvas = canvas;

        this.timer = 0;
    }

    update(deltaTime){

        this.timer += deltaTime;

        const spawned = [];

        if(this.timer >= 1){

            this.timer = 0;

            for(
                let y = 80;
                y < this.canvas.height;
                y += 90
            ){

                spawned.push(

                    new Bullet(
                        -20,
                        y,
                        250,
                        0
                    )
                );

                spawned.push(

                    new Bullet(
                        this.canvas.width + 20,
                        y,
                        -250,
                        0
                    )
                );
            }
        }

        return spawned;
    }
}