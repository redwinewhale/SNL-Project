import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// DB 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("✅ [DB] MySQL 연결 풀이 생성되었습니다.");

export default pool; // 최신 문법의 내보내기 방식