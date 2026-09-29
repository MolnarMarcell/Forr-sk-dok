import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import 'dotenv/config';

const app = express();

//ESM környezetben segédváltozók a relatív útvonalakhoz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);
console.log(__filename);

//Middleware a JSON body feldolgozásához
app.use(express.json());

//log middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ez a főoldal");
});

app.get("/products", (req, res) => {
  res.json([
    { id: 1, name: "Víz", price: 10.99 },
    { id: 2, name: "Kenyér", price: 19.99 },
    { id: 3, name: "Zárfeltörő", price: 5.99 },
  ]);
});

app.post("/products", (req, res) => {
  console.log(req.body);
  if (!req.body.name) {
    return res.status(400).json({ message: "Hiányzó mezők: Name szükséges" });
  }
  if (!req.body.price || typeof req.body.price !== "number" || req.body.price < 0) {
    return res.status(400).json({ message: "Hiányzó mezők: Price szükséges és nem lehet negatív" });
  }
  res.status(201).json({ message: "Termék létrehozva", product: req.body });

});




const PORT = process.env.PORT || 3000;
console.log(`A szerver a ${PORT} porton fut`);
console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

app.get("/about", (req, res) => {
  res.send("Ez az about oldal");
});

app.use((req, res) => {
  // res.status(404).send("Az oldal nem található");
  res.status(404).sendFile(path.join(__dirname, "assets", "404.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});