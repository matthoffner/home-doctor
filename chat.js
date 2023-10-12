// chat.js

let sendBotMessage; // Declare sendBotMessage here so that it can be accessed outside of initializeChat

const worker = new Worker('./worker.js');

worker.addEventListener('message', (event) => {
    const { data } = event;
    
    if (data && data.type === 'result' && data.task === 'image-to-text') {
        const extractedText = data.data; // The text extracted from the image
        
        // Use the extractedText as an initial prompt for the chatbot, if sendBotMessage is defined
        if (sendBotMessage) {
            sendBotMessage(extractedText);
        }
    }
});

export const initializeChat = (initialPrompt) => {
    const APIURL = 'https://api.openai.com/v1/chat/completions';
    const loaderNode = document.getElementById('loader');
    const textBoxNode = document.getElementById('textbox');
    const APIKEY = new URLSearchParams(window.location.search).get('apiKey'); // Fetching the API key from the query parameters

    if (!APIKEY) {
        showChat('error', 'Missing API Key in the URL');
        return;
    }

    let conversation = [
        {
            role: 'system',
            content: 'How are you today? Please ask me anything',
        },
    ];

    if (initialPrompt) {
        sendBotMessage(initialPrompt);
    }

    const showChat = (type, message) => {
        let chatContainerNode = document.createElement('div');
        chatContainerNode.classList.add('message', type);
        let chatText = document.createElement('p');
        chatText.innerHTML = message;
        chatContainerNode.appendChild(chatText);

        textBoxNode.appendChild(chatContainerNode);
        textBoxNode.scrollTop = textBoxNode.scrollHeight;
    };

    const sendBotMessage = async (msg) => {
        loaderNode.style.display = 'block';  // Display loader during processing
        
        let message = {
            role: 'user',
            content: msg,
        };
        conversation.push(message);

        try {
            let chatResponse = await fetch(APIURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${APIKEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: conversation,
                }),
            });

            let responseData = await chatResponse.json();
            if (responseData && responseData.choices && responseData.choices.length > 0) {
                let botResponse = responseData.choices[0].message.content;
                showChat('received', botResponse);
                conversation.push({
                    role: 'assistant',
                    content: botResponse,
                });
            }
        } catch (err) {
            console.log(err);
            showChat('error', `The following error occurred: ${err}`);
        } finally {
            loaderNode.style.display = 'none';  // Hide loader after processing
        }
    };

    const processImageBtn = document.getElementById("process-image");
    const imageUpload = document.getElementById("image-upload");
    
    processImageBtn.addEventListener('click', async () => {
        if (imageUpload.files.length > 0) {
            loaderNode.style.display = 'block'; // show the loader

            const image = imageUpload.files[0];
            const reader = new FileReader();

            reader.readAsDataURL(image);
            reader.onload = () => {
                const base64Image = reader.result.split(',')[1];
                // Now, we send this base64 encoded image to your worker for processing
                // After processing, the worker will send back the extracted text, which can then be used as the initial prompt for the chatbot.
                worker.postMessage({
                    task: 'image-to-text',
                    image: base64Image
                });
            };
        }
    });

    let sendButtonNode = document.getElementById('send-button');
    let userInputNode = document.querySelector('.user-input');

    sendButtonNode.addEventListener('click', async () => {
        let userMessage = userInputNode.value.trim();
        userInputNode.value = '';
        if (userMessage !== '') {
            showChat('sent', userMessage);
            await sendBotMessage(userMessage);
        }
    });

    userInputNode.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            sendButtonNode.click();
        }
    });
};
