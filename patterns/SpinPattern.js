import Bullet from "../bullet.js";

export default class SpinPattern {

    constructor(boss) {
        this.boss = boss;
        this.timer = 0;
        this.angle = 0;
    }

    update(deltaTime) {

        this.timer += deltaTime;

        const spawned = [];

        if (this.timer > 0.05) {

            this.timer = 0;

            const count = 2;

            for (let i = 0; i < count; i++) {

                const angle =
                    this.angle +
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

            this.angle += 0.1;
        }

        return spawned;
    }
}