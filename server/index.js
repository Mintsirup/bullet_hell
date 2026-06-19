import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
    addScore,
    getLeaderboard
} from "./leaderboard.js";

const __filename =
    fileURLToPath(
        import.meta.url
    );

const __dirname =
    path.dirname(
        __filename
    );

const DATA_DIR =
    path.join(
        __dirname,
        "data"
    );

const USERS_FILE =
    path.join(
        DATA_DIR,
        "users.json"
    );

const LEADERBOARD_FILE =
    path.join(
        DATA_DIR,
        "leaderboard.json"
    );

if (!fs.existsSync(DATA_DIR)) {

    fs.mkdirSync(
        DATA_DIR,
        {
            recursive: true
        }
    );
}

if (!fs.existsSync(USERS_FILE)) {

    fs.writeFileSync(
        USERS_FILE,
        "[]"
    );
}

if (!fs.existsSync(LEADERBOARD_FILE)) {

    fs.writeFileSync(
        LEADERBOARD_FILE,
        "[]"
    );
}

function unlockAchievement(
    user,
    id
){

    if(
        !user.achievements.includes(id)
    ){

        user.achievements.push(id);
    }
}

const app =
    express();

app.use(cors());

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    "/client",
    express.static(
        path.join(
            __dirname,
            "../client"
        )
    )
);

app.use(
    "/shared",
    express.static(
        path.join(
            __dirname,
            "../shared"
        )
    )
);

app.use(
    "/style.css",
    express.static(
        path.join(
            __dirname,
            "../style.css"
        )
    )
);

function page(file) {

    return path.join(
        __dirname,
        "../pages",
        file
    );
}

app.get("/", (req, res) => {

    res.sendFile(
        page("index.html")
    );
});

app.get("/login", (req, res) => {

    res.sendFile(
        page("login.html")
    );
});

app.get("/register", (req, res) => {

    res.sendFile(
        page("register.html")
    );
});

app.get("/game", (req, res) => {

    res.sendFile(
        page("game.html")
    );
});

app.get("/result", (req, res) => {

    res.sendFile(
        page("result.html")
    );
});

app.get("/leaderboard", (req, res) => {

    res.sendFile(
        page("leaderboard.html")
    );
});

app.get("/profile", (req,res) => {

    res.sendFile(
        page("profile.html")
    );
    
});

app.get(
    "/api/profile/:username",
    (req,res)=>{

        const users =
            loadUsers();

        const user =
            users.find(

                x =>
                x.username ===
                req.params.username
            );

        if(!user){

            return res
            .status(404)
            .json({

                error:"not found"
            });
        }

        res.json({

            username:
                user.username,

            stats:
                user.stats,

            achievements:
                user.achievements
        });
    }
);

function loadUsers() {

    try {

        return JSON.parse(

            fs.readFileSync(
                USERS_FILE,
                "utf8"
            )
        );

    } catch {

        return [];
    }
}

function saveUsers(users) {

    fs.writeFileSync(

        USERS_FILE,

        JSON.stringify(
            users,
            null,
            4
        )
    );
}

const bannedWords = [

    "시발",
    "씨발",
    "병신",
    "좆",
    "ㅂㅅ",
    "새끼"
];

function containsBadWord(name) {

    return bannedWords.some(
        word =>
            name.includes(word)
    );
}

app.post(
    "/register",
    (req, res) => {

        const {
            username,
            password
        } = req.body;

        const users =
            loadUsers();

        if (
            !username ||
            !password
        ) {

            return res.json({

                success: false,

                error:
                    "아이디와 비밀번호를 입력하세요"
            });
        }

        if (
            username.length < 2 ||
            username.length > 16
        ) {

            return res.json({

                success: false,

                error:
                    "아이디는 2~16자"
            });
        }

        if (
            users.find(
                x =>
                    x.username ===
                    username
            )
        ) {

            return res.json({

                success: false,

                error:
                    "이미 존재하는 아이디"
            });
        }

        users.push({

            username,

            password,

            stats: {

                gamesPlayed: 0,

                highestScore: 0,

                highestRank: "F",

                totalBulletsDodged: 0,

                totalBulletsHit: 0,

                totalSurvivalTime: 0
            },

            achievements: [],

            friends:[],

            friendRequests:[]
        });

        saveUsers(users);

        res.json({
            success: true
        });
    }
);

app.post(
    "/login",
    (req, res) => {

        const {
            username,
            password
        } = req.body;

        const users =
            loadUsers();

        const user =
            users.find(
                x =>
                    x.username ===
                    username &&
                    x.password ===
                    password
            );

        if (!user) {

            return res.json({

                success: false,

                error:
                    "아이디 또는 비밀번호 오류"
            });
        }

        res.json({

            success: true,

            username
        });
    }
);

app.post(
    "/submitReplay",
    (req, res) => {

        try {

            const {
                seed,
                replayData,
                replayHash,
                result,
                username
            } = req.body;

            const unlocked = [];

            const users =
                loadUsers();


            const user =
                users.find(
                    x =>
                        x.username ===
                        username
                );

            const ranks = [

                "F",
                "D",
                "C",
                "B",
                "A",
                "S",
                "S+"
            ];

            if (!username) {

                return res.json({

                    success: false,

                    error:
                        "로그인 필요"
                });
            }

            if (
                containsBadWord(
                    username
                )
            ) {

                return res.json({

                    success: false,

                    error:
                        "사용 불가능한 닉네임"
                });
            }

            const success =
                addScore({

                    name:
                        username,

                    score:
                        result.score,

                    rank:
                        result.rank,

                    seed,

                    replayData,

                    replayHash,

                    time:
                        Date.now()
                });

            if (!success) {

                return res.json({

                    success: false,

                    error:
                        "이미 등록된 리플레이"
                });
            }


            if (user) {

                user.stats.gamesPlayed++;

                user.stats.totalBulletsDodged +=
                    result.bulletsDodged || 0;

                user.stats.totalBulletsHit +=
                    result.bulletsHit || 0;

                user.stats.totalSurvivalTime +=
                    result.survivedTime || 0;

                if (
                    result.score >
                    user.stats.highestScore
                ) {

                    user.stats.highestScore =
                        result.score;
                }

                if (
                    ranks.indexOf(
                        result.rank
                    )
                    >
                    ranks.indexOf(
                        user.stats.highestRank
                    )
                ) {
                    user.stats.highestRank =
                        result.rank;
                }

                // 첫 플레이
                if (
                    !user.achievements.includes(
                        "FIRST_GAME"
                    )
                ) {
                    unlockAchievement(
                        user,
                        "FIRST_GAME"
                    );
                    unlocked.push(
                        "🎮 첫 플레이"
                    );
                }

                // S 랭크
                if (
                    result.rank === "S" ||
                    result.rank === "S+"
                ) {
                    if (
                        !user.achievements.includes(
                            "GET_S"
                        )
                    ) {
                        unlockAchievement(
                            user,
                            "GET_S"
                        );
                        unlocked.push(
                            "⭐ S 랭크 달성"
                        );
                    }
                }

                // S+
                if (
                    result.rank === "S+"
                ) {
                    if (
                        !user.achievements.includes(
                            "GET_S_PLUS"
                        )
                    ) {
                        unlockAchievement(
                            user,
                            "GET_S_PLUS"
                        );
                        unlocked.push(
                            "👑 S+ 랭크 달성"
                        );
                    }
                }

                // 100만점
                if (
                    result.score >=
                    1000000
                ) {
                    if (
                        !user.achievements.includes(
                            "ONE_MILLION"
                        )
                    ) {
                        unlockAchievement(
                            user,
                            "ONE_MILLION"
                        );
                        unlocked.push(
                            "💰 백만점 달성"
                        );
                    }
                }

                // 풀피
                if (
                    result.hp >= 100
                ) {
                    if (
                        !user.achievements.includes(
                            "FULL_HP"
                        )
                    ) {
                        unlockAchievement(
                            user,
                            "FULL_HP"
                        );
                        unlocked.push(
                            "❤️ 풀피 클리어"
                        );
                    }
                }

                // 100판
                if (
                    user.stats.gamesPlayed >=
                    100
                ) {
                    if (
                        !user.achievements.includes(
                            "PLAY_100"
                        )
                    ) {
                        unlockAchievement(
                            user,
                            "PLAY_100"
                        );
                        unlocked.push(
                            "🎯 100판 플레이"
                        );
                    }
                }

                // 총알 100만 회피
                if (
                    user.stats.totalBulletsDodged >=
                    1000000
                ) {

                    if (
                        !user.achievements.includes(
                            "MILLION_DODGE"
                        )
                    ) {

                        unlockAchievement(
                            user,
                            "MILLION_DODGE"
                        );

                        unlocked.push(
                            "🌀 총알 100만 회피"
                        );
                    }
                }

                saveUsers(users);
            }

            res.json({

                success: true,

                result,

                unlocked
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({

                success: false
            });
        }
    }
);

app.post(
    "/api/friend/request",
    (req,res)=>{

        const {
            from,
            to
        } = req.body;

        const users =
            loadUsers();

        const sender =
            users.find(
                x =>
                x.username === from
            );

        const target =
            users.find(
                x =>
                x.username === to
            );

        if(
            !sender ||
            !target
        ){
            return res.json({

                success:false
            });
        }

        if(
            target.friendRequests.includes(
                from
            )
        ){
            return res.json({

                success:false
            });
        }

        if(from === to){

            return res.json({
                success:false
            });
        }

        if(
            target.friends.includes(from)
        ) {

            return res.json({
                success:false
            });
        }

        if(
            target.friendRequests.includes(from)
        ) {

            return res.json({
                success:false
            });
        }

        target.friendRequests.push(
            from
        );

        saveUsers(users);

        res.json({

            success:true
        });
    }
);

app.post(
    "/api/friend/accept",
    (req,res)=>{

        const {
            username,
            friend
        } = req.body;

        const users =
            loadUsers();

        const user =
            users.find(
                x =>
                x.username === username
            );

        const target =
            users.find(
                x =>
                x.username === friend
            );

        if(
            !user ||
            !target
        ){
            return res.json({

                success:false
            });
        }

        user.friendRequests =
            user.friendRequests.filter(
                x =>
                x !== friend
            );

        if(
            user.friends.includes(
                friend
            )
        ) {
            return res.json({

                success:false
            });
        }

        user.friends.push(
            friend
        );

        target.friends.push(
            username
        );

        saveUsers(users);

        res.json({

            success:true
        });
    }
);

app.get(
    "/api/friends/:username",
    (req,res)=>{

        const users =
            loadUsers();

        const user =
            users.find(
                x =>
                x.username ===
                req.params.username
            );

        if(!user){

            return res.json({

                friends: [],
                requests: []
            });
        }

        res.json({

            friends:
                user.friends,

            requests:
                user.friendRequests
        });
    }
);

app.get(
    "/api/user/:username",
    (req,res)=>{

        const users =
            loadUsers();

        const user =
            users.find(
                x =>
                x.username ===
                req.params.username
            );

        if(!user){

            return res
            .status(404)
            .json({
                success:false
            });
        }

        res.json({

            success:true,

            username:
                user.username,

            stats:
                user.stats
        });
    }
);

app.get(
    "/api/leaderboard",
    (req, res) => {

        res.json(
            getLeaderboard()
        );
    }
);

app.get(
    "/api/replay/:id",
    (req,res)=>{

        const file =
            path.join(

                __dirname,

                "data",

                "replays",

                `${req.params.id}.json`
            );

        if(
            !fs.existsSync(
                file
            )
        ){

            return res
            .status(404)
            .json({
                error:"not found"
            });
        }

        res.json(

            JSON.parse(

                fs.readFileSync(
                    file,
                    "utf8"
                )
            )
        );
    }
);

app.listen(
    23333,
    () => {

        console.log(
            "Server running on http://localhost:23333"
        );
    }
);