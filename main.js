let worker = new Worker('worker.js');

worker.addEventListener('message', function(event) {
    if (event.data.type === 'update' && event.data.target === 'output') {
        document.getElementById('output').innerText = event.data.data;
    }
});

function processImage() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const image = event.target.result;

            // Send image data to the worker for processing
            worker.postMessage({
                task: 'image-to-text',
                image: image,
                elementIdToUpdate: 'output',
                generation: {} // any additional options
            });
        };

        reader.readAsDataURL(file);
    } else {
        alert('Please choose an image first.');
    }
}
