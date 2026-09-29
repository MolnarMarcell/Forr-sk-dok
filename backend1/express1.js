import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const app = express();

//ESM környezetben segédváltozók a relativ útvonalak kezeléséhez
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __dirname = path.dirname(__filename);
console.log(__dirname);

//Middleware a JSON body Feldolgozásához
app.use(express.json());

//log middleware
app.use((req, res, next) =>{
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) =>{
    res.send('Ez a főoldal')
});

app.get('/about', (req, res) =>{
    res.send('Ez az about oldal')
});

app.get('/products', (req, res) =>{
    res.json([
        {id: 1, name: 'termék1', price: 1000},
        {id: 2, name: 'termék2', price: 2000},
        {id: 3, name: 'termék3', price: 3000},
    ]);
});

app.post('/products', (req, res) =>{
    console.log(req.body);
    if(!req.body.name){
        return res.status(400).json({message: 'A termék neve kötelező!'});
    }
    if(!req.body.price || typeof req.body.price !== 'number' || req.body.price < 0){
        return res.status(400).json({message: "hiba: A termék ára nem lehet 0 vagy negatív!"});
    }
    res.status(201).json({message: 'Új termék felvéve',product: req.body});
});

app.use((req, res) =>{
   // res.status(404).send('Ez az oldal nem található')
   res.status(404).sendFile(path.join(__dirname, 'assets', '404.html'))
});

const PORT = process.env.PORT || 3000;
console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

app.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}`)
});
