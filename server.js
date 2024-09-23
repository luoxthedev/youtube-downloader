const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));
app.use(express.json());

// Création du dossier de téléchargements s'il n'existe pas
const downloadsDir = path.join(__dirname, 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

app.post('/download', (req, res) => {
    const url = req.body.url;
    const output = path.join(downloadsDir, '%(title)s.%(ext)s');

    // Commande yt-dlp pour télécharger la vidéo
    const command = `yt-dlp -o "${output}" ${url}`;

    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: 'Download failed', details: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Stdout: ${stdout}`);

        // Extraction du nom de fichier téléchargé à partir de stdout ou stderr
        const match = stdout.match(/Merging formats into "(.*?)"/);
        if (match && match[1]) {
            const fileName = path.basename(match[1]);
            return res.json({ file: `/downloads/${fileName}` });
        }

        return res.status(500).json({ error: 'Download failed', details: 'Could not determine file name' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
