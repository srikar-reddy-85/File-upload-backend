const cors = require('cors');
const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('./db');
const app = express();
const pgp = require('pg-promise')();
const port = 3001;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(cors());

const db = pgp({
    user: 'postgres',
    password: 'srikar1',
    host: 'localhost',
    port: 5432, // Default PostgreSQL port
    database: 'TCC',
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, Date.now() + '.' + ext); // Unique filename
    },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
    const image = req.file;
    const imagev2 = req.body.image;
    console.log(imagev2)
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }


    const filename = req.file.filename;
    const description = req.body.description; // Binary content of the uploaded file

    try {
        await db.query('INSERT INTO images (filename, description) VALUES ($1, $2)', [filename, description]);
        res.json({ message: 'File uploaded and saved to database' });
    } catch (error) {
        console.error('Error inserting file into database:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET route to retrieve image data
app.get('/images', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM images');
        const images = result.rows;

        res.json(images);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving images' });
    }
});

app.delete('/images/:id', async (req, res) => {
    const imageId = req.params.id;

    try {
        // Attempt to delete the image from the database based on its ID
        const result = await db.result('DELETE FROM images WHERE id = $1', [imageId]);

        if (result.rowCount === 1) {
            res.json({ message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
