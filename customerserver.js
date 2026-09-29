import express from 'express';
import 'dotenv/config';
import mysql from 'mysql2/promise';

const poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections : true,
    connectionLimit : 10,
    queueLimit: 0,
};

const pool = mysql.createPool(poolConfig);

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get('/', (req,res) => {
    res.send("Kezdőlap");
});


app.get('/api/vevok', async (req,res) => {
    try {
        const [sorok] = await pool.query('SELECT * FROM vevok');
        res.json(sorok);
    }
    catch (error) {
        console.error('Error fetching the data: ', error);
        res.status(500).json({error : 'Internal server error'})
    }
})

app.get('/api/vevok/:id', async (req,res) => {
    const id = Number(req.params.id);

    try {
        const [sorok] = await pool.query('SELECT * FROM vevok WHERE id = ?', [id])

        if (sorok.length === 0)
        {
            return res.status(404).json({message : 'Nem található ilyen vevő'});
        }

        res.json(sorok[0]);
    }
    catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({error: "Internal server error!"});
    }
})

app.post('/api/vevok', async (req, res) => {
    const {nev,email,reg_datuma} = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO vevok (nev, email,reg_datuma) VALUES (?, ?, ?)',
            [nev,email,reg_datuma]
        );

        res.status(201).json({
            id: result.insertId,
            nev,
            email,
            reg_datuma,
        });
    } catch (error) {
        console.error('Hiba a vevő létrehozása közben', error);
        res.status(500).json({ error: 'Internal server error!' });
    }
});

app.put('/api/vevok/:id', async (req,res) => {
    const id = Number(req.params.id);
    const {nev,email,reg_datuma} = req.body;

    try {
        const [result] = await pool.query('UPDATE vevok SET nev = ?, email = ?, reg_datuma = ? WHERE id = ?', [nev,email,reg_datuma, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({error : 'Nem található!'})
        }
        res.status(200).json({id,nev,email,reg_datuma});
    }
    catch (error) {
        console.error('Hiba a vevő frissitése közben', error)
        res.status(500).json({error: 'Internal server error!'});
    }
});

app.delete('/api/vevok/:id', async (req,res) => {
    const id = Number(req.params.id);

    try {
        const [result] = await pool.query('DELETE FROM vevok where id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Nem található ilyen vevő!"});
        }

        return res.status(200).json({message : "A vevő törölve.", id});
    }
    catch (error) {
        console.error("Hiba a vevő törlése közben:", error);
        return res.status(500).json({error: "Internal server error"});
    }
});



app.listen(PORT, () =>{
    console.log(`bookserver is running on port ${PORT}`)
});




