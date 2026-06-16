export default class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.radius = 30;

        this.baseX = x;
        this.baseY = y;

        this.phase = 1;
        this.timer = 0;
    }

    update(deltaTime) {
        this.timer += deltaTime;

        if (this.timer >= 20) {
            this.phase = 2;
        }

        if (this.timer >= 40) {
            this.phase = 3;
        }

        if (this.timer >= 120) {
            this.phase = 4;
        }

        this.x =
            this.baseX +
            Math.sin(this.timer * 2) * 250;
        
    }

    draw(ctx) {
        ctx.fillStyle = "purple";

        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}