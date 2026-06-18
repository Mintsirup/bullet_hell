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

        const users =
            loadUsers();

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

            password
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
                name
            } = req.body;

            if (!name) {

                return res.json({

                    success: false,

                    error:
                        "닉네임 없음"
                });
            }

            if (
                containsBadWord(
                    name
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

                    name,

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

            res.json({

                success: true,

                result
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({

                success: false
            });
        }
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