export function showAchievement(title){

    const container =
        document.getElementById(
            "achievementContainer"
        );

    if(!container)
        return;

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "achievementToast";

    toast.innerHTML =
    `
    <div class="achievementTitle">
        🏆 업적 달성
    </div>

    <div class="achievementName">
        ${title}
    </div>
    `;

    container.appendChild(
        toast
    );

    setTimeout(
        () => {

            toast.remove();

        },
        5000
    );
}