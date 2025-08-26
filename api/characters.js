import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  // Enable CORS for Owlbear extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await pool.connect();

    switch (req.method) {
      case 'GET':
        await handleGetCharacters(req, res, client);
        break;
      case 'POST':
        await handleCreateCharacter(req, res, client);
        break;
      case 'PUT':
        await handleUpdateCharacter(req, res, client);
        break;
      case 'DELETE':
        await handleDeleteCharacter(req, res, client);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

    client.release();
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetCharacters(req, res, client) {
  const { roomId } = req.query;
  
  if (!roomId) {
    res.status(400).json({ error: 'roomId is required' });
    return;
  }

  const result = await client.query(
    'SELECT * FROM characters WHERE room_id = $1 ORDER BY created_at DESC',
    [roomId]
  );

  const characters = {};
  result.rows.forEach(row => {
    characters[row.character_id] = {
      id: row.character_id,
      name: row.name,
      data: row.equipment_data,
      lastModified: row.updated_at
    };
  });

  res.status(200).json(characters);
}

async function handleCreateCharacter(req, res, client) {
  const { roomId, characterId, name, data } = req.body;

  if (!roomId || !characterId || !name) {
    res.status(400).json({ error: 'roomId, characterId, and name are required' });
    return;
  }

  const result = await client.query(
    `INSERT INTO characters (room_id, character_id, name, equipment_data, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (room_id, character_id) 
     DO UPDATE SET name = $3, equipment_data = $4, updated_at = NOW()
     RETURNING *`,
    [roomId, characterId, name, JSON.stringify(data || {})]
  );

  res.status(201).json({
    id: result.rows[0].character_id,
    name: result.rows[0].name,
    data: result.rows[0].equipment_data,
    lastModified: result.rows[0].updated_at
  });
}

async function handleUpdateCharacter(req, res, client) {
  const { roomId, characterId, name, data } = req.body;

  if (!roomId || !characterId) {
    res.status(400).json({ error: 'roomId and characterId are required' });
    return;
  }

  const result = await client.query(
    `UPDATE characters 
     SET name = COALESCE($3, name), 
         equipment_data = COALESCE($4, equipment_data), 
         updated_at = NOW()
     WHERE room_id = $1 AND character_id = $2
     RETURNING *`,
    [roomId, characterId, name, data ? JSON.stringify(data) : null]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }

  res.status(200).json({
    id: result.rows[0].character_id,
    name: result.rows[0].name,
    data: result.rows[0].equipment_data,
    lastModified: result.rows[0].updated_at
  });
}

async function handleDeleteCharacter(req, res, client) {
  const { roomId, characterId } = req.query;

  if (!roomId || !characterId) {
    res.status(400).json({ error: 'roomId and characterId are required' });
    return;
  }

  const result = await client.query(
    'DELETE FROM characters WHERE room_id = $1 AND character_id = $2 RETURNING *',
    [roomId, characterId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }

  res.status(200).json({ message: 'Character deleted successfully' });
}