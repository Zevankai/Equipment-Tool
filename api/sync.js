const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async function handler(req, res) {
  // Enable CORS for Owlbear extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const client = await pool.connect();
    const { roomId, localData } = req.body;

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      client.release();
      return;
    }

    // Get all characters from database for this room
    const dbResult = await client.query(
      'SELECT * FROM characters WHERE room_id = $1',
      [roomId]
    );

    const dbCharacters = {};
    dbResult.rows.forEach(row => {
      dbCharacters[row.character_id] = {
        id: row.character_id,
        name: row.name,
        data: row.equipment_data,
        lastModified: new Date(row.updated_at)
      };
    });

    const syncResult = {
      conflicts: [],
      updated: [],
      created: [],
      synced: []
    };

    // Process local characters
    if (localData && typeof localData === 'object') {
      for (const [characterId, localChar] of Object.entries(localData)) {
        const dbChar = dbCharacters[characterId];
        const localModified = localChar.lastModified ? new Date(localChar.lastModified) : new Date(0);

        if (!dbChar) {
          // Character doesn't exist in DB, create it
          await client.query(
            `INSERT INTO characters (room_id, character_id, name, equipment_data, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [roomId, characterId, localChar.name || 'Unnamed Character', JSON.stringify(localChar.data || {})]
          );
          syncResult.created.push(characterId);
        } else {
          const dbModified = new Date(dbChar.lastModified);
          
          if (localModified > dbModified) {
            // Local is newer, update database
            await client.query(
              `UPDATE characters 
               SET name = $3, equipment_data = $4, updated_at = NOW()
               WHERE room_id = $1 AND character_id = $2`,
              [roomId, characterId, localChar.name, JSON.stringify(localChar.data)]
            );
            syncResult.updated.push(characterId);
          } else if (dbModified > localModified) {
            // Database is newer, flag as conflict for client to resolve
            syncResult.conflicts.push({
              characterId,
              localData: localChar,
              serverData: dbChar
            });
          } else {
            // Same modification time, consider synced
            syncResult.synced.push(characterId);
          }
        }
      }
    }

    // Get final state from database
    const finalResult = await client.query(
      'SELECT * FROM characters WHERE room_id = $1 ORDER BY updated_at DESC',
      [roomId]
    );

    const finalCharacters = {};
    finalResult.rows.forEach(row => {
      finalCharacters[row.character_id] = {
        id: row.character_id,
        name: row.name,
        data: row.equipment_data,
        lastModified: row.updated_at
      };
    });

    client.release();

    res.status(200).json({
      characters: finalCharacters,
      syncResult
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}