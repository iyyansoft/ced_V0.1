import mysql from 'mysql2/promise';

export const saveToDatabase = async (formData) => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'your_database'
  });

  const query = `
    INSERT INTO registrations (email, name, designation, mobile, faculty, institute, city)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    formData.email,
    formData.name,
    formData.designation,
    formData.mobile,
    formData.faculty,
    formData.institute,
    formData.city
  ];

  try {
    await connection.execute(query, values);
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await connection.end();
  }
};
