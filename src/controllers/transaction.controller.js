import { ApiError } from '../utils/ApiError.js';
import { getId } from '../utils/user.js';

export async function listTransactions(c) {
  let user_id = getId(c.get('user'));
  const db = c.env.DB;
  const transactions = await db.prepare('SELECT * FROM transactions WHERE user_id = ?').bind(user_id).all();
  return c.json(transactions.results);
}

export async function createTransaction(c) {
  let user_id = getId(c.get('user'));
  const db = c.env.DB;
  const { amount, type, description } = await c.req.json();
  if (!user_id || !amount || !type) throw new ApiError(400, 'Missing fields');
  const result = await db
    .prepare('INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)')
    .bind(user_id, amount, type, description)
    .run();
  console.log(result);
  const id = Number(result?.meta?.last_row_id);
  
  return c.json(
    {
      message: 'Transaction created',
      id: Number.isInteger(id) && id > 0 ? id : null
    },
    201
  );
}

export async function deleteTxById(c) {
  let id;
  try {
    id = c.req.param('id');
  } catch (err) {
    throw new ApiError(500, err);
  }
  if(!id) throw new ApiError(500, `Transaction id is ${id}`);
  
  const db = c.env.DB;
  try {
    await db.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();
  } catch (err) {
    throw new ApiError(400, err);
  }
  
  return c.json({ message: "Transaction has been deleted successfully!" });
}

export async function updateTransaction(c) {
  let id;
  try {
    id = c.req.param('id');
  } catch (err) {
    throw new ApiError(500, err);
  }
  if(!id) throw new ApiError(500, `Transaction id is ${id}`);
  
  const db = c.env.DB;
  const { amount, type, description } = await c.req.json();
  try {
    if(amount && type && description) {
      await db.prepare("UPDATE transactions SET type = ?, amount = ?, description = ? WHERE id = ?").bind(type, amount, description, id).run();
    } else if(description && amount) {
      await db.prepare("UPDATE transactions SET amount = ?, description = ? WHERE id = ?").bind(amount, description, id).run();
    } else if(description && type) {
      await db.prepare("UPDATE transactions SET type = ?, description = ? WHERE id = ?").bind(type, description, id).run();
    } else if(type && amount) {
      await db.prepare("UPDATE transactions SET amount = ?, type = ? WHERE id = ?").bind(amount, type, id).run();
    } else if(description) {
      await db.prepare("UPDATE transactions SET description = ? WHERE id = ?").bind(description, id).run();
    } else if(type) {
      await db.prepare("UPDATE transactions SET type = ? WHERE id = ?").bind(type, id).run();
    } else if(amount) {
      await db.prepare("UPDATE transactions SET amount = ? WHERE id = ?").bind(amount, id).run();
    } else {
      throw new Error("No field found to update.");
    }
  } catch (err) {
    throw new ApiError(500, err);
  }
  return c.json({ statusCode: 200, message: "Transactions has been updated successfully."});
}

export async function saveTransaction(c) {
  const user_id = getId(c.get('user'));
  const { list } = await c.req.json();
  if (!Array.isArray(list) || list.length === 0) throw new ApiError(404, "List of transaction is not found");
  const db = c.env.DB;
  const statements = list.map(tx => db.prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)").bind(user_id, tx.amount, tx.type, tx.description));
  let results;
  try {
    results = await db.batch(statements);
    console.log(results);
  } catch (err) {
    console.log(err);
    throw new ApiError(500, err);
  }
  
  const ids = results
  .map(result => Number(result?.meta?.last_row_id))
  .filter(id => Number.isInteger(id) && id > 0);
    
    return c.json({message: "Transactions inserted successfully.", ids});
  }
