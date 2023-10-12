import { initializeChat } from './chat.js';

let textBoxNode;
let loaderNode;

function appendImageToChat(base64Image) {
    const imgNode = document.createElement('img');
    imgNode.src = `data:image/jpeg;base64,${base64Image}`;
    imgNode.alt = "Uploaded Image";
    imgNode.className = "chat-image"; // Optional: Add a class for styling

    textBoxNode.appendChild(imgNode);
}

function getImageDataFromImage(original) {
    // Helper function to get image data from image element
    const canvas = document.createElement('canvas');
    canvas.width = original.naturalWidth;
    canvas.height = original.naturalHeight;
  
    const ctx = canvas.getContext('2d');
  
    // Optional: You can adjust these canvas context properties to tweak the rendering quality
    // ctx.patternQuality = 'bilinear';
    // ctx.quality = 'bilinear';
    // ctx.antialias = 'default';
    // ctx.imageSmoothingQuality = 'high';
  
    ctx.drawImage(original, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
  }
  

document.addEventListener('DOMContentLoaded', () => {
    textBoxNode = document.getElementById('textbox');
    loaderNode = document.getElementById('loader');
    
    const worker = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module',
    });

    worker.onmessage = (event) => {
        const data = event.data;

        loaderNode.style.display = 'none'; // hide the loader

        switch(data.task) {
            case 'image-to-text':
                const extractedText = data.data;
                const generatedText = extractedText[0].generated_text;
                textBoxNode.innerHTML += `<div class="message received">Extracted from image: ${generatedText}</div>`;
                if (generatedText) {
                    initializeChat(`I've uploaded an image, I know you can't see but here is the image caption result: ${generatedText}, reply back with a helpful response from the caption I provided`);
                }
                break;

            case 'image-classification':
                // Handle image classification results
                const topClassification = data.data[0].label;
                textBoxNode.innerHTML += `<div class="message received">Top classification: ${topClassification}</div>`;
                break;

            case 'object-detection':
                // Handle object detection results
                const detectedObjects = data.data.map(obj => obj.label).join(', ');
                textBoxNode.innerHTML += `<div class="message received">Detected objects: ${detectedObjects}</div>`;
                break;
        }
    };

    const processImageBtn = document.getElementById("process-image");
    const imageUpload = document.getElementById("image-upload");
    const taskSelect = document.getElementById("task-select"); // Assuming you have a dropdown with this ID to select the task

    processImageBtn.addEventListener('click', async () => {
        if (imageUpload.files.length > 0) {
            loaderNode.style.display = 'block'; // show loader

            const selectedTask = taskSelect.value; // Read selected task from dropdown
    
            const image = imageUpload.files[0];
            const reader = new FileReader();
    
            reader.onload = () => {
                const imageElement = new Image();
                imageElement.onload = () => {
                    const base64Image = getImageDataFromImage(imageElement).split(',')[1];
                    appendImageToChat(base64Image);

                    // Post the message based on the selected task
                    worker.postMessage({
                        task: selectedTask,
                        image: `data:image/jpeg;base64,${base64Image}`
                    });
                };
                imageElement.src = reader.result;
            };
            reader.readAsDataURL(image);
        }
    });    

    initializeChat();
});
