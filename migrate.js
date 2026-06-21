/**
 * migrate-passwords.js
 * 기존 평문 비밀번호를 bcrypt 해시로 일괄 변환합니다.
 *
 * 사용법:
 *   node migrate-passwords.js
 *
 * - 이미 bcrypt 해시인 계정은 건너뜁니다 ($2b$ 로 시작하는 값)
 * - 변환 전 users.json을 users.json.bak 으로 백업합니다
 * - 서버 실행 전에 한 번만 실행하면 됩니다
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, "server", "data", "users.json");
const BCRYPT_ROUNDS = 12;

function isBcryptHash(str) {
    return typeof str === "string" && str.startsWith("$2b$");
}

async function migrate() {

    if (!fs.existsSync(USERS_FILE)) {
        console.error("users.json 파일을 찾을 수 없습니다:", USERS_FILE);
        process.exit(1);
    }

    // 백업
    const backupPath = USERS_FILE + ".bak";
    fs.copyFileSync(USERS_FILE, backupPath);
    console.log("백업 완료:", backupPath);

    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {

        if (isBcryptHash(user.password)) {
            console.log(`  건너뜀 (이미 해시됨): ${user.username}`);
            skipped++;
            continue;
        }

        user.password = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
        console.log(`  변환 완료: ${user.username}`);
        migrated++;
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));

    console.log(`\n완료 — 변환: ${migrated}명 / 건너뜀: ${skipped}명`);
}

migrate().catch(err => {
    console.error("마이그레이션 실패:", err);
    process.exit(1);
});