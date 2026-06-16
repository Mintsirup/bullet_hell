export function drawPlayer(
    ctx,
    player
) {

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}