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
    
        let promptMessage = "";  // This will hold the message for the initializeChat function
    
        switch(data.task) {
            case 'image-to-text':
                const generatedText = data.data[0].generated_text;
                textBoxNode.innerHTML += `<div class="message received">Extracted from image: ${generatedText}</div>`;
                promptMessage = `I've uploaded an image. Based on its content, the caption is: "${generatedText}". Can you help me understand more about it?`;
                break;
    
            case 'image-classification':
                const topClassification = data.data[0].label;
                textBoxNode.innerHTML += `<div class="message received">Top classification: ${topClassification}</div>`;
                promptMessage = `I've uploaded an image and it was classified as "${topClassification}". What can you tell me about this classification?`;
                break;
    
            case 'object-detection':
                if (data.data && data.data.length > 0) {
                    const detectedObjects = data.data.map(obj => obj.label).join(', ');
                    textBoxNode.innerHTML += `<div class="message received">Detected objects: ${detectedObjects}</div>`;
                    promptMessage = `I've uploaded an image and detected the following objects: ${detectedObjects}. Can you provide more details or context about these?`;
                } else {
                    textBoxNode.innerHTML += `<div class="message received">No objects detected.</div>`;
                    promptMessage = `I've uploaded an image, but couldn't detect any distinct objects in it. Can you provide some general insights or suggestions based on this?`;
                }
                break;
        }
    
        // Call initializeChat with the created prompt
        if (promptMessage) {
            initializeChat(promptMessage);
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
