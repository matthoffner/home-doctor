// chat.js

let conversation = [
    {
        role: 'system',
        content: 'This is a photo chat. Users will upload images and expect the model to provide insights, classifications, or descriptions. Assist them based on the provided image content or related queries.',
    },
];

export const initializeChat = async (initialPrompt) => {
    const defaultAPIURL = 'https://api.openai.com/v1/chat/completions';
    
    // Fetch the base URL and API key from the query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const APIURL = queryParams.get('baseURL') || defaultAPIURL;  
    const APIKEY = queryParams.get('apiKey');

    const loaderNode = document.getElementById('loader');
    const textBoxNode = document.getElementById('textbox');

    const showChat = (type, message) => {
        let chatContainerNode = document.createElement('div');
        chatContainerNode.classList.add('message', type);
        let chatText = document.createElement('p');
        chatText.innerHTML = message;
        chatContainerNode.appendChild(chatText);

        textBoxNode.appendChild(chatContainerNode);
        textBoxNode.scrollTop = textBoxNode.scrollHeight;
    };

    // Check if no API key and the default URL is being used
    if (!APIKEY && APIURL === defaultAPIURL) {
        showChat('error', 'Missing API Key in the URL');
        return;
    }

    const sendBotMessage = async (msg) => {
        loaderNode.style.display = 'block';  // Display loader during processing
        
        let message = {
            role: 'user',
            content: msg,
        };
        conversation.push(message);

        let headers = {
            'Content-Type': 'application/json'
        };

        // Only add Authorization header if APIKEY is present
        if (APIKEY) {
            headers['Authorization'] = `Bearer ${APIKEY}`;
        }

        try {
            let chatResponse = await fetch(APIURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: 'gpt-4',
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

    if (initialPrompt) {
        await sendBotMessage(initialPrompt);
    }

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
