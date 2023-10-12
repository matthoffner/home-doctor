## Home Doctor

A simple web application allowing users to upload an image which is then processed and converted to text. The output is used as an input to an interactive chatbot.

### Setup

1. **Clone the Repository**

    ```bash
    git clone https://github.com/matthoffner/home-doctor
    cd home-doctor
    ```

2. **Start the Development Server**

    In the root directory of your project, run:

    ```bash
    npx servor
    ```

3. **Navigate to the App with API Key**

    Open your browser and navigate to:

    ```
    http://localhost:8080/index.html?apiKey=YOUR_OPENAI_API_KEY
    ```

    Replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key. Note: This method exposes your API key in the URL. It's only suitable for local testing and not for production usage.

4. **Usage**

    - Upload an image to get it processed.
    - Interact with the chatbot using the text input.
