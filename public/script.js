document.getElementById('download-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const url = document.getElementById('youtube-url').value;
    const messageDiv = document.getElementById('message');
    const loader = document.getElementById('loader');
    const videoPreview = document.getElementById('video-preview');

    if (validateYouTubeUrl(url)) {
        messageDiv.innerHTML = '';
        loader.style.display = 'block';
        videoPreview.innerHTML = '';

        const loadingTime = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;

        setTimeout(() => {
            fetch('/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            })
            .then(response => response.json())
            .then(data => {
                loader.style.display = 'none';
                if (data.file) {
                    messageDiv.innerHTML = '<p style="color: green;">Téléchargement terminé avec succès !</p>';
                    videoPreview.innerHTML = `
                        <video controls width="600">
                            <source src="${data.file}" type="video/mp4">
                            Votre navigateur ne supporte pas la balise vidéo.
                        </video>
                        <br>
                        <a href="${data.file}" download class="btn-download">Télécharger la vidéo</a>
                    `;
                } else {
                    messageDiv.innerHTML = `<p style="color: red;">Erreur lors du téléchargement. ${data.details || 'Veuillez réessayer.'}</p>`;
                }
            })
            .catch(error => {
                loader.style.display = 'none';
                messageDiv.innerHTML = '<p style="color: red;">Erreur lors du téléchargement. Veuillez réessayer.</p>';
            });
        }, loadingTime);
    } else {
        messageDiv.innerHTML = '<p style="color: red;">URL invalide. Veuillez entrer une URL YouTube valide.</p>';
    }
});

function validateYouTubeUrl(url) {
    const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
}
