import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
    addScore,
    getLeaderboard
} from "./leaderboard.js";

import Bullet from "../shared/bullet.js";
import Player from "../shared/player.js";
import Boss from "../shared/boss.js";
import RNG from "../shared/RNG.js";
import { calculateScore } from "../shared/ScoreCalculator.js";

import CirclePattern from "../shared/patterns/CirclePattern.js";
import RainPattern from "../shared/patterns/RainPattern.js";
import SpinPattern from "../shared/patterns/SpinPattern.js";
import WallPattern from "../shared/patterns/WallPattern.js";
import ManyCirclePattern from "../shared/patterns/ManyCirclePattern.js";

import CrossRainPattern from "../shared/patterns/hardcore/CrossRainPattern.js";
import ExplosionPattern from "../shared/patterns/hardcore/ExplosionPattern.js";
import ReverseCirclePattern from "../shared/patterns/hardcore/ReverseCirclePattern.js";
import RingTrapPattern from "../shared/patterns/hardcore/RingTrapPattern.js";
import ShotgunPattern from "../shared/patterns/hardcore/ShotgunPattern.js";
import SpiralBurstPattern from "../shared/patterns/hardcore/SpiralBurstPattern.js";
import SpiralRainPattern from "../shared/patterns/hardcore/SpiralRainPattern.js";
import HardcoreWallPattern from "../shared/patterns/hardcore/WallPattern.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");
const REPLAY_DIR = path.join(DATA_DIR, "replays");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(REPLAY_DIR)) fs.mkdirSync(REPLAY_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
if (!fs.existsSync(LEADERBOARD_FILE)) fs.writeFileSync(LEADERBOARD_FILE, "[]");

// ─── JWT 설정 ────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const JWT_EXPIRES = "7d";

function signToken(username) {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// 미들웨어: Authorization: Bearer <token> 헤더에서 유저 추출
function requireAuth(req, res, next) {
    const header = req.headers["authorization"] || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, error: "로그인 필요" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload.username;
        next();
    } catch {
        return res.status(401).json({ success: false, error: "인증 만료 — 다시 로그인하세요" });
    }
}
// ────────────────────────────────────────────────────────────────────

// ─── 동시성 잠금 ─────────────────────────────────────────────────────
let writeLock = Promise.resolve();

function withUserLock(fn) {
    writeLock = writeLock.then(fn).catch(fn);
    return writeLock;
}
// ────────────────────────────────────────────────────────────────────

const SERVER_CANVAS = { width: 1280, height: 720 };
const BCRYPT_ROUNDS = 12;
const MAX_REPLAY_FRAMES = 10000;

function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    } catch {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));
}

const bannedWords = ["시발", "씨발", "병신", "좆", "ㅂㅅ", "새끼"];

function containsBadWord(name) {
    return bannedWords.some(word => name.includes(word));
}

function unlockAchievement(user, id) {
    if (!user.achievements.includes(id)) {
        user.achievements.push(id);
    }
}

// ─── 리플레이 서버 검증 ──────────────────────────────────────────────
function simulateReplay(seed, replayData, mode) {

    const FIXED_DELTA = 1 / 60;
    const rng = new RNG(seed);
    const keys = {};

    const gameStats = {
        bulletsSpawned: 0,
        bulletsHit: 0,
        survivedTime: 0,
        phase4Time: 0
    };

    const bullets = [];
    const boss = new Boss(SERVER_CANVAS.width / 2, 100);

    function makePhase(phaseNumber) {

        if (mode === "hardcore") {

            const map = {
                1: () => ({
                    phaseNumber: 1,
                    patterns: [new SpiralBurstPattern(boss)],
                    update(dt) { const s = []; for (const p of this.patterns) s.push(...p.update(dt)); return s; }
                }),
                2: () => ({
                    phaseNumber: 2,
                    patterns: [new HardcoreWallPattern(SERVER_CANVAS), new ReverseCirclePattern(boss)],
                    update(dt) { const s = []; for (const p of this.patterns) s.push(...p.update(dt)); return s; }
                }),
                3: () => ({
                    phaseNumber: 3,
                    patterns: [new CrossRainPattern(boss, rng), new RingTrapPattern(boss)],
                    update(dt) { const s = []; for (const p of this.patterns) s.push(...p.update(dt)); return s; }
                }),
                4: () => ({
                    phaseNumber: 4,
                    patterns: [new SpiralRainPattern(SERVER_CANVAS), new ExplosionPattern(SERVER_CANVAS, boss, rng)],
                    update(dt) { const s = []; for (const p of this.patterns) s.push(...p.update(dt)); return s; }
                })
            };

            return map[phaseNumber]?.() ?? null;

        } else {

            if (phaseNumber === 3) {
                return {
                    phaseNumber: 3,
                    changeTimer: 0,
                    currentPatterns: getRandomNormalPhase3Patterns(rng, boss),
                    update(dt) {
                        this.changeTimer += dt;
                        if (this.changeTimer >= 5) {
                            this.changeTimer = 0;
                            this.currentPatterns = getRandomNormalPhase3Patterns(rng, boss);
                        }
                        const s = [];
                        for (const p of this.currentPatterns) s.push(...p.update(dt));
                        return s;
                    }
                };
            }

            const map = {
                1: () => ({
                    phaseNumber: 1,
                    patterns: [new CirclePattern(boss)],
                    update(dt) { const s = []; for (const p of this.patterns) s.push(...p.update(dt)); return s; }
                }),
                2: () => ({
                    phaseNumber: 2,
                    patterns: [new ManyCirclePattern(boss), new SpinPattern(boss)],
                    update(dt) { const s = []; for (const p of this.patterns) s.push(...p.update(dt)); return s; }
                }),
                4: () => ({
                    phaseNumber: 4,
                    patterns: [new CirclePattern(boss), new SpinPattern(boss)],
                    update(dt) { const s = []; for (const p of this.patterns) s.push(...p.update(dt)); return s; }
                })
            };

            return map[phaseNumber]?.() ?? null;
        }
    }

    function getRandomNormalPhase3Patterns(rng, boss) {
        const roll = rng.next();
        if (roll < 0.25) return [new WallPattern(SERVER_CANVAS, rng)];
        const pool = [
            () => new CirclePattern(boss),
            () => new RainPattern(SERVER_CANVAS, rng),
            () => new SpinPattern(boss)
        ];
        const shuffled = [...pool].sort(() => rng.next() - 0.5);
        return [shuffled[0](), shuffled[1]()];
    }

    const player = new Player(
        SERVER_CANVAS.width / 2,
        SERVER_CANVAS.height / 2,
        keys,
        SERVER_CANVAS,
        gameStats
    );

    if (mode === "hardcore") {
        player.maxHp = 3;
        player.hp = 3;
    }

    let phase = makePhase(1);
    let frame = 0;
    let replayIndex = 0;
    let gameEnded = false;
    let cleared = false;

    while (!gameEnded && frame < MAX_REPLAY_FRAMES) {

        frame++;

        while (
            replayIndex < replayData.length &&
            replayData[replayIndex].frame <= frame
        ) {
            const event = replayData[replayIndex];
            keys[event.key] = event.type === "down";
            replayIndex++;
        }

        boss.update(FIXED_DELTA);

        if (phase.phaseNumber !== boss.phase) {
            phase = makePhase(boss.phase);
        }

        const spawned = phase.update(FIXED_DELTA);
        bullets.push(...spawned);
        gameStats.bulletsSpawned += spawned.length;
        gameStats.survivedTime += FIXED_DELTA;

        if (boss.phase === 4) gameStats.phase4Time += FIXED_DELTA;

        player.update(FIXED_DELTA);

        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.update(FIXED_DELTA);
            if (
                b.x < -50 || b.x > SERVER_CANVAS.width + 50 ||
                b.y < -50 || b.y > SERVER_CANVAS.height + 50
            ) {
                bullets.splice(i, 1);
            }
        }

        player.checkHits(bullets);

        if (player.hp <= 0) { gameEnded = true; cleared = false; }
        if (gameStats.phase4Time >= 120) { gameEnded = true; cleared = true; }
    }

    const scoreResult = calculateScore(gameStats, player, mode);

    return {
        score: scoreResult.score,
        rank: scoreResult.rank,
        bulletsDodged: scoreResult.bulletsDodged,
        bulletsHit: gameStats.bulletsHit,
        bulletsSpawned: gameStats.bulletsSpawned,
        survivedTime: gameStats.survivedTime,
        phase4Time: gameStats.phase4Time,
        hp: player.hp,
        cleared,
        mode
    };
}
// ────────────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/client", express.static(path.join(__dirname, "../client")));
app.use("/shared", express.static(path.join(__dirname, "../shared")));
app.use("/style.css", express.static(path.join(__dirname, "../style.css")));

function page(file) {
    return path.join(__dirname, "../pages", file);
}

app.get("/", (req, res) => res.sendFile(page("index.html")));
app.get("/login", (req, res) => res.sendFile(page("login.html")));
app.get("/register", (req, res) => res.sendFile(page("register.html")));
app.get("/game", (req, res) => res.sendFile(page("game.html")));
app.get("/result", (req, res) => res.sendFile(page("result.html")));
app.get("/leaderboard", (req, res) => res.sendFile(page("leaderboard.html")));
app.get("/profile", (req, res) => res.sendFile(page("profile.html")));

app.get("/api/profile/:username", (req, res) => {
    const users = loadUsers();
    const user = users.find(x => x.username === req.params.username);
    if (!user) return res.status(404).json({ error: "not found" });
    res.json({
        username: user.username,
        stats: user.stats,
        achievements: user.achievements
    });
});

// ─── 회원가입 ────────────────────────────────────────────────────────
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.json({ success: false, error: "아이디와 비밀번호를 입력하세요" });

    if (username.length < 2 || username.length > 16)
        return res.json({ success: false, error: "아이디는 2~16자" });

    if (containsBadWord(username))
        return res.json({ success: false, error: "사용 불가능한 닉네임" });

    await withUserLock(async () => {
        const users = loadUsers();

        if (users.find(x => x.username === username)) {
            return res.json({ success: false, error: "이미 존재하는 아이디" });
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

        users.push({
            username,
            password: hashedPassword,
            stats: {
                gamesPlayed: 0,
                highestScore: 0,
                highestRank: "F",
                totalBulletsDodged: 0,
                totalBulletsHit: 0,
                totalSurvivalTime: 0
            },
            achievements: [],
            friends: [],
            friendRequests: []
        });

        saveUsers(users);

        const token = signToken(username);
        res.json({ success: true, token, username });
    });
});

// ─── 로그인 ──────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    const user = users.find(x => x.username === username);

    if (!user)
        return res.json({ success: false, error: "아이디 또는 비밀번호 오류" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
        return res.json({ success: false, error: "아이디 또는 비밀번호 오류" });

    const token = signToken(username);
    res.json({ success: true, token, username });
});

// ─── 리플레이 제출 (인증 필수) ───────────────────────────────────────
app.post("/submitReplay", requireAuth, async (req, res) => {
    try {
        const { seed, replayData, result } = req.body;
        const username = req.user; // JWT에서 추출 — 클라이언트 값 무시

        if (!seed || !Array.isArray(replayData))
            return res.json({ success: false, error: "잘못된 리플레이" });

        // ── 크기 제한 ────────────────────────────────────────────────
        if (replayData.length > MAX_REPLAY_FRAMES)
            return res.json({ success: false, error: "리플레이가 너무 깁니다" });

        const users = loadUsers();
        const user = users.find(x => x.username === username);

        if (!user)
            return res.json({ success: false, error: "유저 없음" });

        const mode = result?.mode ?? "normal";

        if (mode === "hardcore") {
            const hardcoreUnlocked =
                user.achievements.includes("GET_S") ||
                user.achievements.includes("GET_S_PLUS");

            if (!hardcoreUnlocked)
                return res.json({ success: false, error: "하드코어 미해금" });
        }

        let serverResult;
        try {
            serverResult = simulateReplay(seed, replayData, mode);
        } catch (simErr) {
            console.error("시뮬레이션 오류:", simErr);
            return res.json({ success: false, error: "리플레이 검증 실패" });
        }

        const scoreDiff = Math.abs(serverResult.score - result.score);
        const scoreThreshold = Math.max(serverResult.score * 0.05, 1000);

        if (scoreDiff > scoreThreshold || serverResult.rank !== result.rank) {
            console.warn(
                `[검증 실패] ${username}: ` +
                `클라이언트 ${result.score}(${result.rank}) vs ` +
                `서버 ${serverResult.score}(${serverResult.rank})`
            );
            return res.json({ success: false, error: "리플레이 검증 불일치" });
        }

        const verifiedResult = serverResult;

        const realReplayHash = crypto
            .createHash("sha256")
            .update(JSON.stringify(replayData))
            .digest("hex");

        const success = addScore({
            name: username,
            score: verifiedResult.score,
            rank: verifiedResult.rank,
            mode,
            replayHash: realReplayHash,
            seed,
            replayData
        });

        if (!success)
            return res.json({ success: false, error: "이미 등록된 리플레이" });

        const unlocked = [];

        function rankValue(rank) {
            const map = {
                "F": 0, "D": 1, "C": 2, "B": 3, "A": 4, "S": 5, "S+": 6,
                "HC-F": 7, "HC-D": 8, "HC-C": 9, "HC-B": 10,
                "HC-A": 11, "HC-S": 12, "HC-S+": 13
            };
            return map[rank] ?? 0;
        }

        await withUserLock(async () => {
            const users = loadUsers();
            const user = users.find(x => x.username === username);
            if (!user) return;

            user.stats.gamesPlayed++;
            user.stats.totalBulletsDodged += verifiedResult.bulletsDodged || 0;
            user.stats.totalBulletsHit += verifiedResult.bulletsHit || 0;
            user.stats.totalSurvivalTime += verifiedResult.survivedTime || 0;

            if (verifiedResult.score > user.stats.highestScore)
                user.stats.highestScore = verifiedResult.score;

            if (rankValue(verifiedResult.rank) > rankValue(user.stats.highestRank))
                user.stats.highestRank = verifiedResult.rank;

            if (!user.achievements.includes("FIRST_GAME")) {
                unlockAchievement(user, "FIRST_GAME"); unlocked.push("🎮 첫 플레이");
            }
            if ((verifiedResult.rank === "S" || verifiedResult.rank === "S+") &&
                !user.achievements.includes("GET_S")) {
                unlockAchievement(user, "GET_S"); unlocked.push("⭐ S 랭크 달성");
            }
            if (verifiedResult.rank === "S+" && !user.achievements.includes("GET_S_PLUS")) {
                unlockAchievement(user, "GET_S_PLUS"); unlocked.push("👑 S+ 랭크 달성");
            }
            if (verifiedResult.score >= 1000000 && !user.achievements.includes("ONE_MILLION")) {
                unlockAchievement(user, "ONE_MILLION"); unlocked.push("💰 백만점 달성");
            }
            const maxHp = mode === "hardcore" ? 3 : 100;
            if (verifiedResult.hp === maxHp && !user.achievements.includes("FULL_HP")) {
                unlockAchievement(user, "FULL_HP"); unlocked.push("❤️ 풀피 클리어");
            }
            if (user.stats.gamesPlayed >= 100 && !user.achievements.includes("PLAY_100")) {
                unlockAchievement(user, "PLAY_100"); unlocked.push("🎯 100판 플레이");
            }
            if (user.stats.totalBulletsDodged >= 1000000 && !user.achievements.includes("MILLION_DODGE")) {
                unlockAchievement(user, "MILLION_DODGE"); unlocked.push("🌀 총알 100만 회피");
            }
            if (mode === "hardcore" && verifiedResult.cleared && !user.achievements.includes("HARDCORE_CLEAR")) {
                unlockAchievement(user, "HARDCORE_CLEAR"); unlocked.push("🔥 하드코어 클리어");
            }
            if (mode === "hardcore" &&
                (verifiedResult.rank === "HC-S" || verifiedResult.rank === "HC-S+") &&
                !user.achievements.includes("HARDCORE_S")) {
                unlockAchievement(user, "HARDCORE_S"); unlocked.push("⚡ 하드코어 S 랭크");
            }

            saveUsers(users);
        });

        res.json({ success: true, result: verifiedResult, unlocked });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

app.get("/api/hardcore-unlock/:username", (req, res) => {
    const users = loadUsers();
    const user = users.find(x => x.username === req.params.username);
    if (!user) return res.json({ unlocked: false });
    res.json({
        unlocked:
            user.achievements.includes("GET_S") ||
            user.achievements.includes("GET_S_PLUS")
    });
});

// ─── 친구 요청 (인증 필수) ───────────────────────────────────────────
app.post("/api/friend/request", requireAuth, async (req, res) => {
    const from = req.user; // JWT에서 추출
    const { to } = req.body;

    if (!to) return res.json({ success: false, error: "대상 없음" });
    if (from === to) return res.json({ success: false, error: "자기 자신에게 요청 불가" });

    await withUserLock(async () => {
        const users = loadUsers();
        const sender = users.find(x => x.username === from);
        const target = users.find(x => x.username === to);

        if (!sender || !target)
            return res.json({ success: false, error: "유저 없음" });

        target.friends ??= [];
        target.friendRequests ??= [];
        sender.friends ??= [];

        if (target.friends.includes(from))
            return res.json({ success: false, error: "이미 친구" });
        if (target.friendRequests.includes(from))
            return res.json({ success: false, error: "이미 요청 보냄" });

        target.friendRequests.push(from);
        saveUsers(users);
        res.json({ success: true });
    });
});

// ─── 친구 수락 (인증 필수) ───────────────────────────────────────────
app.post("/api/friend/accept", requireAuth, async (req, res) => {
    const username = req.user; // JWT에서 추출
    const { friend } = req.body;

    if (!friend) return res.json({ success: false, error: "대상 없음" });

    await withUserLock(async () => {
        const users = loadUsers();
        const user = users.find(x => x.username === username);
        const target = users.find(x => x.username === friend);

        if (!user || !target) return res.json({ success: false });

        user.friendRequests = user.friendRequests.filter(x => x !== friend);

        if (user.friends.includes(friend)) return res.json({ success: false });

        user.friends.push(friend);
        target.friends ??= [];
        target.friends.push(username);
        saveUsers(users);
        res.json({ success: true });
    });
});

app.get("/api/friends/:username", (req, res) => {
    const users = loadUsers();
    const user = users.find(x => x.username === req.params.username);
    if (!user) return res.json({ friends: [], requests: [] });
    res.json({ friends: user.friends, requests: user.friendRequests });
});

app.get("/api/user/:username", (req, res) => {
    const users = loadUsers();
    const user = users.find(x => x.username === req.params.username);
    if (!user) return res.status(404).json({ success: false });
    res.json({ success: true, username: user.username, stats: user.stats });
});

app.get("/api/leaderboard", (req, res) => {
    const mode = req.query.mode;
    res.json(getLeaderboard(mode));
});

// ─── 리플레이 조회 — 경로 탐색 취약점 수정 ──────────────────────────
app.get("/api/replay/:id", (req, res) => {
    const safeId = path.basename(req.params.id); // ../../ 등 차단
    const file = path.join(REPLAY_DIR, `${safeId}.json`);

    if (!fs.existsSync(file))
        return res.status(404).json({ error: "not found" });

    res.json(JSON.parse(fs.readFileSync(file, "utf8")));
});

app.listen(23333, () => {
    console.log("Server running on http://localhost:23333");
});

setInterval(() => { console.log("alive"); }, 10000);
