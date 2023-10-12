import { initializeChat } from './chat.js';

let textBoxNode;
let loaderNode;

document.addEventListener('DOMContentLoaded', () => {
    textBoxNode = document.getElementById('textbox');
    loaderNode = document.getElementById('loader');
    
    const worker = new Worker('./worker.js', { type: 'module' });

    worker.onmessage = (event) => {
        const data = event.data;

        if (data.type === 'result' && data.task === 'image-to-text') {
            const extractedText = data.data;
            textBoxNode.innerHTML += `<div class="message received">Extracted from image: ${extractedText}</div>`;
            loaderNode.style.display = 'none'; // hide the loader
            
            // Now, use the extracted text to interact with the GPT chatbot
            initializeChat(extractedText);
        }
    };

    const processImageBtn = document.getElementById("process-image");
    const imageUpload = document.getElementById("image-upload");

    processImageBtn.addEventListener('click', async () => {
        if (imageUpload.files.length > 0) {
            loaderNode.style.display = 'block'; // show loader

            const image = imageUpload.files[0];
            const reader = new FileReader();

            reader.readAsDataURL(image);
            reader.onload = () => {
                const base64Image = reader.result.split(',')[1];
                worker.postMessage({
                    task: 'image-to-text',
                    image: base64Image
                });
            };
        }
    });

    initializeChat();
});
