import { initializeChat } from './chat.js';

const worker = new Worker('worker.js');

let textBoxNode = document.getElementById('textbox');
let loaderNode = document.getElementById('loader');

worker.onmessage = (event) => {
    const data = event.data;

    if (data.type === 'result' && data.task === 'image-to-text') {
        const extractedText = data.data;
        textBoxNode.innerHTML += `<div class="message received">Extracted from image: ${extractedText}</div>`;
        loaderNode.style.display = 'none'; // hide the loader
        
        // Now, use the extracted text to interact with the GPT chatbot
        // Assuming your chatbot function accepts a message parameter
        initializeChat(extractedText);
    }
};

document.addEventListener('DOMContentLoaded', () => {
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
});
