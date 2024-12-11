const express = require('express');
const path = require('path');
const db = require('./db-connector');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

// ********** PLAYER *********

// GET players
app.get('/read-players', (req, res) => {
    const query = `
        SELECT 
            Players.player_id,
            Players.name,
            Classes.description AS class_name,
            Players.level,
            Races.name AS race_name, 
            Players.xp,
            Players.hp,
            Players.initiative,
            Players.strength,
            Players.dexterity,
            Players.constitution,
            Players.wisdom,
            Players.charisma
        FROM Players
        LEFT JOIN Classes ON Players.class_id = Classes.class_id
        LEFT JOIN Races ON Players.race_id = Races.race_id; -- Include this if you have a Races table
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching players:', err);
            res.status(500).send('Database error');
        } else {
            res.json(results); // Send the enriched data as JSON
        }
    });
});

// CREATE player
app.post('/create-player', (req, res) => {
    const {
        name,
        class_id,
        level,
        race_id,
        xp,
        hp,
        initiative,
        strength,
        dexterity,
        constitution,
        wisdom,
        charisma,
    } = req.body;

    const query = `
        INSERT INTO Players 
            (name, class_id, level, race_id, xp, hp, initiative, strength, dexterity, constitution, wisdom, charisma)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    `;

    const values = [
        name,
        class_id,
        level,
        race_id,
        xp,
        hp,
        initiative,
        strength,
        dexterity,
        constitution,
        wisdom,
        charisma,
    ];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting player:', err);
            res.status(500).send('Failed to create player.');
        } else {
            res.status(201).send('Player created successfully.');
        }
    });
});

// UPDATE Player

app.put('/put-player', (req, res) => {
    const {
        player_id, name, class_id, level, race_id, xp, hp, initiative,
        strength, dexterity, constitution, wisdom, charisma
    } = req.body;

    const query = `
        UPDATE Players 
        SET name = ?, class_id = ?, level = ?, race_id = ?, xp = ?, hp = ?, 
        initiative = ?, strength = ?, dexterity = ?, constitution = ?, 
        wisdom = ?, charisma = ?
        WHERE player_id = ?;
    `;
    db.query(query, [name, class_id, level, race_id, xp, hp, initiative, 
        strength, dexterity, constitution, wisdom, charisma, player_id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Failed to update player.');
        } else {
            res.status(200).send('Player updated successfully.');
        }
    });
});

// DELETE Player
app.delete('/delete-player', (req, res) => {
    const { player_id } = req.body;

    const query = 'DELETE FROM Players WHERE player_id = ?';
    db.query(query, [player_id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Failed to delete player.');
        } else {
            res.status(204).send('Player deleted successfully.');
        }
    });
});

// ********** RACES *********

// GET Races
app.get('/read-races', (req, res) => {
    const query = `
        SELECT 
            Races.race_id,
            Races.name, 
            Races.description 
        FROM Races;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching races:', err);
            res.status(500).send('Database error');
        } else {
            res.json(results); // Send the enriched data as JSON
        }
    });
});

// CREATE Race
app.post('/create-race', (req, res) => {
    const {
        name,
        description
    } = req.body;

    const query = `
        INSERT INTO Races
        (name, description)
        VALUES (?, ?)
    `;

    const values = [
        name,
        description
    ];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting race:', err);
            res.status(500).send('Failed to create race.');
        } else {
            res.status(201).send('Race created successfully.');
        }
    });
});

app.put('/put-race', (req, res) => {
    const { race_id, name, description } = req.body;

    const query = `
        UPDATE Races
        SET name = ?, description = ?
        WHERE race_id = ?;
    `;

    db.query(query, [name, description, race_id], (err) => {
        if (err) {
            console.error('Error updating race:', err);
            res.status(500).send('Failed to update race.');
        } else {
            res.status(200).send('Race updated successfully.');
        }
    });
});


// DELETE Race
app.delete('/delete-race', (req, res) => {
    const { race_id } = req.body;

    const query = 'DELETE FROM Races WHERE race_id = ?';
    db.query(query, [race_id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Failed to delete race.');
        } else {
            res.status(204).send('Race deleted successfully.');
        }
    });
});

// ********** CLASSES *********
// GET classes
app.get('/classes', (req, res) => {
    const query = `
        SELECT 
            Classes.class_id,
            Classes.description, 
            Classes.hit_die,
            Classes.stat_bonus 
        FROM Classes;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching races:', err);
            res.status(500).send('Database error');
        } else {
            res.json(results); // Send the enriched data as JSON
        }
    });
});

// Add class
app.post('/add-class', async (req, res) => {
    const { description, hitDie, statBonus } = req.body;

    try {
        const query = 'INSERT INTO Classes (description, hit_die, stat_bonus) VALUES (?, ?, ?)';
        await db.query(query, [description, hitDie, statBonus]);
        res.status(201).send('Class added successfully.');
    } catch (err) {
        console.error('Error adding class:', err);
        res.status(500).send('Failed to add class.');
    }
});

// Update class
app.put('/update-class/:class_id', async (req, res) => {
    const { class_id } = req.params;
    const { description, hitDie, statBonus } = req.body;

    try {
        const query = 'UPDATE Classes SET description = ?, hit_die = ?, stat_bonus = ? WHERE class_id = ?';
        await db.query(query, [description, hitDie, statBonus, class_id]);
        res.status(200).send('Class updated successfully.');
    } catch (err) {
        console.error('Error updating class:', err);
        res.status(500).send('Failed to update class.');
    }
});

// Delete class
app.delete('/delete-class', (req, res) => {
    const { class_id } = req.body;

    const query = 'DELETE FROM Classes WHERE class_id = ?';
    db.query(query, [class_id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Failed to delete class.');
        } else {
            res.status(204).send('Class deleted successfully.');
        }
    });
});

// *************TODO: SKILLS, INVENTORY ************



// READ all skills
app.get('/read-skills', (req, res) => {
    const query = `SELECT * FROM Skills`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching skills:', err);
            res.status(500).send('Database error');
        } else {
            res.json(results); // Send skills data as JSON
        }
    });
});

// CREATE a new skill
app.post('/create-skill', (req, res) => {
    const { name, description } = req.body;

    const query = `
        INSERT INTO Skills (name, description)
        VALUES (?, ?)
    `;

    db.query(query, [name, description], (err, results) => {
        if (err) {
            console.error('Error creating skill:', err);
            res.status(500).send('Failed to create skill.');
        } else {
            res.status(201).send('Skill created successfully.');
        }
    });
});

// UPDATE a skill
app.put('/update-skill/:skill_id', (req, res) => {
    const { skill_id } = req.params;
    const { name, description } = req.body;

    const query = `
        UPDATE Skills
        SET name = ?, description = ?
        WHERE skill_id = ?
    `;

    db.query(query, [name, description, skill_id], (err) => {
        if (err) {
            console.error('Error updating skill:', err);
            res.status(500).send('Failed to update skill.');
        } else {
            res.status(200).send('Skill updated successfully.');
        }
    });
});

// DELETE a skill
app.delete('/delete-skill', (req, res) => {
    const { skill_id } = req.body;

    const query = `DELETE FROM Skills WHERE skill_id = ?`;

    db.query(query, [skill_id], (err) => {
        if (err) {
            console.error('Error deleting skill:', err);
            res.status(500).send('Failed to delete skill.');
        } else {
            res.status(204).send('Skill deleted successfully.');
        }
    });
});

// Inventory bullshit that refuses to work



// Fetch all players
app.get('/read-players', (req, res) => {
    const query = `SELECT player_id, name FROM Players`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching players:', err);
            res.status(500).send('Failed to fetch players.');
        } else {
            res.json(results); // Return list of players
        }
    });
});

// Fetch inventory for a specific player
app.get('/read-player-inventory/:player_id', (req, res) => {
    const { player_id } = req.params;
    const query = `
        SELECT pi.player_id, pi.item_id, pi.quantity,
               i.name, i.item_type, i.effect, i.defense_rating,
               i.damage, i.weight, i.description
        FROM PlayerItems pi
        JOIN Items i ON pi.item_id = i.item_id
        WHERE pi.player_id = ?;
    `;
    db.query(query, [player_id], (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            res.status(500).send('Failed to fetch inventory.');
        } else {
            res.json(results); // Return inventory data
        }
    });
});

// Add an item to a player's inventory
app.post('/add-player-item', (req, res) => {
    const { player_id, item_id, quantity } = req.body;
    const query = `
        INSERT INTO PlayerItems (player_id, item_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
    `;
    db.query(query, [player_id, item_id, quantity], (err) => {
        if (err) {
            console.error('Error adding item to inventory:', err);
            res.status(500).send('Failed to add item.');
        } else {
            res.status(201).send('Item added successfully.');
        }
    });
});

// Update inventory item quantity
app.put('/update-player-item', (req, res) => {
    const { player_id, item_id, quantity } = req.body;
    const query = `
        UPDATE PlayerItems
        SET quantity = ?
        WHERE player_id = ? AND item_id = ?;
    `;
    db.query(query, [quantity, player_id, item_id], (err) => {
        if (err) {
            console.error('Error updating item quantity:', err);
            res.status(500).send('Failed to update item quantity.');
        } else {
            res.status(200).send('Item quantity updated successfully.');
        }
    });
});

// Delete item from player's inventory
app.delete('/delete-player-item', (req, res) => {
    const { player_id, item_id } = req.body;
    const query = `
        DELETE FROM PlayerItems
        WHERE player_id = ? AND item_id = ?;
    `;
    db.query(query, [player_id, item_id], (err) => {
        if (err) {
            console.error('Error deleting item from inventory:', err);
            res.status(500).send('Failed to delete item.');
        } else {
            res.status(204).send('Item deleted successfully.');
        }
    });
});

app.get('/read-items', (req, res) => {
    const query = `
        SELECT item_id, name, item_type, description
        FROM Items
        ORDER BY name;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching items:', err);
            res.status(500).send('Failed to fetch items.');
        } else {
            res.json(results); // Send the items as JSON response
        }
    });
});


// fetch classes and races for Players section
app.get('/read-classes', (req, res) => {
    const query = `SELECT class_id, description FROM Classes ORDER BY description`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching classes:', err);
            res.status(500).send('Failed to fetch classes.');
        } else {
            res.json(results); // Return the classes as a JSON response
        }
    });
});

app.get('/read-races', (req, res) => {
    const query = `SELECT race_id, description FROM Races ORDER BY description`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching races:', err);
            res.status(500).send('Failed to fetch races.');
        } else {
            res.json(results); // Return the races as a JSON response
        }
    });
});

// Start the server
const PORT = process.env.PORT || 44594;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
