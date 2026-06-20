const achievementNames = {

    FIRST_GAME: "🎮 첫 플레이",
    GET_S: "⭐ S 랭크",
    GET_S_PLUS: "👑 S+ 랭크",
    ONE_MILLION: "💰 백만점",
    FULL_HP: "❤️ 풀피 클리어",
    PLAY_100: "🎯 100판 플레이",
    MILLION_DODGE: "🌀 100만 회피",
    HARDCORE_CLEAR: "☠️ 하드코어 클리어",
    HARDCORE_S: "🔥 하드코어 S랭크"
};

const username =
    localStorage.getItem(
        "username"
    );

if (!username) {

    location.href =
        "/login";
}

async function loadProfile() {

    const response =
        await fetch(
            `/api/profile/${username}`
        );

    if (!response.ok) {

        alert(
            "프로필을 불러올 수 없음"
        );

        return;
    }

    const data =
        await response.json();

    document
    .getElementById(
        "username"
    )
    .textContent =
        `닉네임: ${data.username}`;

    document
    .getElementById(
        "highestScore"
    )
    .textContent =
        `최고 점수: ${data.stats.highestScore}`;

    document
    .getElementById(
        "highestRank"
    )
    .textContent =
        `최고 랭크: ${data.stats.highestRank}`;

    document
    .getElementById(
        "gamesPlayed"
    )
    .textContent =
        `플레이 횟수: ${data.stats.gamesPlayed}`;

    document
    .getElementById(
        "totalDodged"
    )
    .textContent =
        `총 회피 수: ${data.stats.totalBulletsDodged}`;

    document
    .getElementById(
        "totalSurvival"
    )
    .textContent =
        `총 생존 시간: ${Math.floor(
            data.stats.totalSurvivalTime
        )}초`;

    const list =
        document.getElementById(
            "achievements"
        );

    list.innerHTML = "";

    Object.entries(
        achievementNames
    ).forEach(

        ([id, text]) => {

            const unlocked =

                data.achievements.includes(
                    id
                );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                unlocked
                ? "achievementCard"
                : "achievementCard locked";

            const icon =
                text.split(" ")[0];

            const title =
                text.substring(
                    icon.length
                ).trim();

            card.innerHTML =
            `
            <div class="achievementIcon">
                ${icon}
            </div>

            <div class="achievementTitle">
                ${title}
            </div>
            `;

            list.appendChild(
                card
            );
        }
    );
}

async function loadFriends() {

    try {

        const response =
            await fetch(
                `/api/friends/${username}`
            );

        const data =
            await response.json();

        console.log(data);

        const friends =
            data.friends || [];

        const requests =
            data.requests || [];

        const friendsDiv =
            document.getElementById(
                "friends"
            );

        friendsDiv.innerHTML = "";

        friends.forEach(
            friend => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "friendCard";

                div.textContent =
                    friend;

                friendsDiv.appendChild(
                    div
                );
            }
        );

        const requestsDiv =
            document.getElementById(
                "requests"
            );

        requestsDiv.innerHTML = "";

        requests.forEach(
            request => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "requestCard";

                card.innerHTML =
                `
                <span>
                    ${request}
                </span>

                <button
                    class="acceptBtn"
                >
                    수락
                </button>
                `;

                const button =
                    card.querySelector(
                    ".acceptBtn"
                );

                button.onclick =
                async () => {

                    const response =
                        await fetch(

                            "/api/friend/accept",

                            {
                                method:"POST",

                                headers:{
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                JSON.stringify({

                                    username,

                                    friend:
                                        request
                                })
                            }
                        );

                    const data =
                        await response.json();

                    if(
                        data.success
                    ){

                        alert(
                            "친구 추가 완료"
                        );

                        loadFriends();

                    }else{

                        alert(
                            "친구 추가 실패"
                        );
                    }
                };

                requestsDiv.appendChild(
                    card
                );
            }
        );

    } catch(err){

        console.error(err);
    }
}

document
.getElementById(
    "addFriend"
)
.onclick =
async () => {

    const friend =

        document
        .getElementById(
            "friendName"
        )
        .value
        .trim();

    if (!friend)
        return;

    await fetch(

        "/api/friend/request",

        {
            method:"POST",

            headers:{
                "Content-Type":
                    "application/json"
            },

            body:
            JSON.stringify({

                from:
                    username,

                to:
                    friend
            })
        }
    );

    alert(
        "친구 요청 보냄"
    );

    document
    .getElementById(
        "friendName"
    )
    .value = "";

    loadFriends();
};

document
.getElementById(
    "searchBtn"
)
.onclick =
async()=>{

    const username =

        document
        .getElementById(
            "searchName"
        )
        .value;

    const res =
        await fetch(
            `/api/user/${username}`
        );

    const data =
        await res.json();

    if(!data.success){

        alert(
            "유저 없음"
        );

        return;
    }

    document
        .getElementById(
            "searchResult"
        )
        .innerHTML =

        `
        <div class="userCard">

            <h3>
                ${data.username}
            </h3>

            <p>
                최고 점수 :
                ${data.stats.highestScore}
            </p>

            <p>
                최고 랭크 :
                ${data.stats.highestRank}
            </p>

        </div>
        `;
};

loadProfile();
loadFriends();