import { pool } from "./db";

export const getCounter = async (): Promise<number> => {
  const result = await pool.query(`
    SELECT
        value
    FROM
        counter
    WHERE
        id = 1
  `);

  return result.rows[0]?.value || 0;
};

export const incrementCounter = async (): Promise<number> => {
  const result = await pool.query(`
    UPDATE
        counter
    SET
        value = value + 1
    WHERE
        id = 1
    RETURNING
        value
  `);
  return result.rows[0].value;
};
