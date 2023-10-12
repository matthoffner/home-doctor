// chat.js

export const initializeChat = (initialPrompt) => {
    const APIURL = 'https://api.openai.com/v1/chat/completions';
    const loaderNode = document.getElementById('loader');
    const textBoxNode = document.getElementById('textbox');
    const APIKEY = new URLSearchParams(window.location.search).get('apiKey'); // Fetching the API key from the query parameters

    const showChat = (type, message) => {
        let chatContainerNode = document.createElement('div');
        chatContainerNode.classList.add('message', type);
        let chatText = document.createElement('p');
        chatText.innerHTML = message;
        chatContainerNode.appendChild(chatText);

        textBoxNode.appendChild(chatContainerNode);
        textBoxNode.scrollTop = textBoxNode.scrollHeight;
    };

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

    if (initialPrompt) {
        sendBotMessage(initialPrompt);
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
