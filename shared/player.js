export default class Player {
    constructor(
        x,
        y,
        keys,
        canvas,
        gameStats
    ) {
        this.x = x;
        this.y = y;

        this.keys = keys;
        this.canvas = canvas;
        this.gameStats = gameStats;

        this.radius = 10;
        this.speed = 400;

        this.maxHp = 100;
        this.hp = this.maxHp;
    }

    update(deltaTime) {

        if (this.keys["w"]) {
            this.y -= this.speed * deltaTime;
        }

        if (this.keys["s"]) {
            this.y += this.speed * deltaTime;
        }

        if (this.keys["a"]) {
            this.x -= this.speed * deltaTime;
        }

        if (this.keys["d"]) {
            this.x += this.speed * deltaTime;
        }

        this.x = Math.max(
            this.radius,
            this.x
        );

        this.x = Math.min(
            this.canvas.width - this.radius,
            this.x
        );

        this.y = Math.max(
            this.radius,
            this.y
        );

        this.y = Math.min(
            this.canvas.height - this.radius,
            this.y
        );
    }

    checkHits(bullets) {

        for (let i = bullets.length - 1; i >= 0; i--) {

            const bullet = bullets[i];

            const dx = this.x - bullet.x;
            const dy = this.y - bullet.y;

            const distance =
                Math.hypot(dx, dy);

            if (
                distance <
                this.radius +
                bullet.radius
            ) {

                this.hp--;

                this.gameStats.bulletsHit++;

                bullets.splice(i, 1);
            }
        }
    }
}