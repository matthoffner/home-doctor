# photo-chat

A simple web application allowing users to upload an image which is then processed and converted to text, classified, or has objects detected using transformers.js. The output is used as an input to an interactive chatbot.

### Features

- Image to text conversion
- Image classification
- Object detection

## Models

- **Image Captioning**: [Xenova/vit-gpt2-image-captioning](https://huggingface.co/Xenova/vit-gpt2-image-captioning)
- **Image Classification**: [Xenova/vit-base-patch16-224](https://huggingface.co/Xenova/vit-base-patch16-224)
- **Object Detection**: [Xenova/detr-resnet-50](https://huggingface.co/Xenova/detr-resnet-50)
- **Chatbot**: GPT-4 (OpenAI completions API, can be swapped with llama-cpp-python server)
