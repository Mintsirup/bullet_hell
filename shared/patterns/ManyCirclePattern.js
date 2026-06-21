import Bullet from "../bullet.js";

export default class ManyCirclePattern {

    constructor(boss) {
        this.boss = boss;
        this.timer = 0;
    }

    update(deltaTime) {

        this.timer += deltaTime;

        const spawned = [];

        if (this.timer > 0.2) {

            this.timer = 0;

            const count = 20;

            for (let i = 0; i < count; i++) {

                const angle =
                    (Math.PI * 2 * i) / count;

                spawned.push(
                    new Bullet(
                        this.boss.x,
                        this.boss.y,
                        Math.cos(angle) * 240,
                        Math.sin(angle) * 240
                    )
                );
            }
        }

        return spawned;
    }
}