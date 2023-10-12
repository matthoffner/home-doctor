// chat.js

export const initializeChat = () => {
    const APIURL = 'https://api.openai.com/v1/chat/completions';
    let conversation = [
        {
            role: 'system',
            content: 'How are you today? Please ask me anything',
        },
    ];

    const sendBotMessage = async (msg, APIKEY) => {
        let message = {
            role: 'user',
            content: msg,
        };
        conversation.push(message);

        let data = {
            model: 'gpt-3.5-turbo',
            messages: conversation,
        };

        try {
            let chatResponse = await fetch(APIURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${APIKEY}`,
                },
                body: JSON.stringify(data),
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
        }
    };

    const showChat = (type, message) => {
        let textBoxNode = document.getElementById('textbox');
        let chatContainerNode = document.createElement('div');
        chatContainerNode.classList.add('message', type);
        let chatText = document.createElement('p');
        chatText.innerHTML = message;
        chatContainerNode.appendChild(chatText);

        textBoxNode.appendChild(chatContainerNode);
        textBoxNode.scrollTop = textBoxNode.scrollHeight;
    };

    let sendButtonNode = document.getElementById('send-button');
    let userInputNode = document.querySelector('.user-input');

    sendButtonNode.addEventListener('click', async () => {
        let userMessage = userInputNode.value.trim();
        userInputNode.value = '';
        if (userMessage === '') {
            return;
        } else {
            try {
                let response = await fetch('https://openai-chatbot-server.onrender.com/api/key');
                if (!response.ok) {
                    throw new Error('Error occurred while fetching the API key');
                }
      
                let keyData = await response.json();
                let APIKEY = keyData.apiKey;
      
                if (!APIKEY) {
                    showChat('error', 'Missing API Key');
                    return;
                }
      
                showChat('sent', userMessage);
                await sendBotMessage(userMessage, APIKEY);
            } catch (err) {
                showChat('error', 'Failed to fetch from API');
                console.log(err);
            }
        }
    });

    userInputNode.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            sendButtonNode.click();
        }
    });
};
