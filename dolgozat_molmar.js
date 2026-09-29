import express from "express";
import mysql from "mysql2/promise";
import 'dotenv/config';

const poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const pool = mysql.createPool(poolConfig);

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req,res) => {
    res.send("Kezdőlap");
});

app.get("/api/termekek/elerheto", async (req,res) => {
     try {
        const [sorok] = await pool.query('SELECT * FROM termekek WHERE keszlet>0 ORDER BY nev asc');
        res.json(sorok);
        res.status(200).json({message : "Sikeres lekérés!"})
     }
     catch (error) {
        console.error('Error fetching the data', error);
        res.status(500).json({error : 'Internal server error!'})
     }
})

app.get('/api/termekek/:id', async (req,res) => {
    try {
        const id = Number(req.params.id);
        
        const [sorok ] = await pool.query('SELECT * from termekek where id = ?', [id]);

        if (sorok.length === 0) {
            return res.status(404).json({ error: 'Termék nem található' });
        };
        res.json(sorok[0]);
        res.status(200).json(res.json(sorok[0]))
    }
    catch (error) {
        console.error('Error fetching the data', error);
        res.status(500).json({error : 'Internal server error!'});
    }
});

app.post('/api/termekek', async (req,res) => {
    const {nev,ar,keszlet} = req.body;

    if (!nev || !ar ||!keszlet) {
        return res.status(400).json({ error: 'A név az ár és a készlet kötelező!' });
    }

    try {
        const [result] = await pool.query('INSERT INTO termekek (nev, ar, keszlet) VALUES (?, ?, ?)',[nev,ar,keszlet]);

        res.status(201).json({
            id: result.insertId,
            nev,
            ar,
            keszlet
        });
    }
    catch (error) {
        console.error('Error creating the product', error);
        res.status(500).json({error : 'Internal server error!'});
    }
});

app.put('/api/termekek/:id', async (req,res) => {
    try {
        const id = Number(req.params.id);
        const {nev,ar,keszlet} = req.body;

        if (!nev || !ar ||!keszlet) {
            return res.status(400).json({ error: 'A név az ár és a készlet kötelező!' });
        }

        const [result] = await pool.query('UPDATE termekek SET nev=?, ar=?, keszlet=? WHERE id = ?', [nev,ar,keszlet,id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nem található ilyen termék'});
        }

        res.status(200).json({id, nev,ar,keszlet});
    }
    catch (error) {
        console.error('Error updating the product:', error);
        res.status(500).json({ error: 'Internal server error!' }); 
    }
});

app.get('/api/vevok/:id/rendelesek', async (req,res) => {
    try {
        const id = Number(req.params.id);
        
        const [sorok] = await pool.query('SELECT t.id, t.nev AS termek_neve, t.ar as termek_ara from rendelesek inner JOIN termekek t ON termek_id = t.id WHERE rendelesek.vevo_id =?', [id]);

        if (sorok.length === 0) {
            return res.status(404).json({ error: 'a vevő nem található.' });
        };
        res.json(sorok[0]);
        res.status(200).json(res.json(sorok[0]))
    }
    catch (error) {
        console.error('Error fetching the data', error);
        res.status(500).json({error : 'Internal server error!'});
    }
})



app.listen(PORT, () => {
    console.log('A szerver a', PORT + " Fut" + " "+ "http://localhost:8000")
})
