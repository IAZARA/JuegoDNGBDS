const db = require('../db/connection');
const bcrypt = require('bcrypt');

class User {
  static async create({ username, email, password, fullName }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (username, email, password_hash, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, full_name, total_points, level, created_at
    `;
    
    const values = [username, email, hashedPassword, fullName];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }
  
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }
  
  static async findById(id) {
    const query = `
      SELECT id, username, email, full_name, avatar_url, total_points, level, created_at
      FROM users WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
  
  static async updatePoints(userId, points) {
    const query = `
      UPDATE users 
      SET total_points = total_points + $2,
          level = CASE 
            WHEN total_points + $2 >= 1000 THEN 4
            WHEN total_points + $2 >= 500 THEN 3
            WHEN total_points + $2 >= 200 THEN 2
            ELSE 1
          END
      WHERE id = $1
      RETURNING total_points, level
    `;
    
    const result = await db.query(query, [userId, points]);
    return result.rows[0];
  }
  
  static async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;