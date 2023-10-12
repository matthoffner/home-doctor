import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.2";
env.allowLocalModels = false;

// Define task function mapping
const TASK_FUNCTION_MAPPING = {
    'image-to-text': image_to_text,
}

// Listen for messages from UI
self.addEventListener('message', async (event) => {
    const data = event.data;
    let fn = TASK_FUNCTION_MAPPING[data.task];

    if (!fn) return;

    let result = await fn(data);
    self.postMessage({
        task: data.task,
        type: 'result',
        data: result
    });
});

// Define model factory for image-to-text
class ImageToTextPipelineFactory {
    static task = 'image-to-text';
    static model = 'Xenova/vit-gpt2-image-captioning';

    static instance = null;

    static getInstance(progressCallback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, {
                progress_callback: progressCallback
            });
        }

        return this.instance;
    }
}

async function image_to_text(data) {
    let pipeline = await ImageToTextPipelineFactory.getInstance(data => {
        self.postMessage({
            type: 'download',
            task: 'image-to-text',
            data: data
        });
    })

    return await pipeline(data.image, {
        ...data.generation,
        callback_function: function (beams) {
            const decodedText = pipeline.tokenizer.decode(beams[0].output_token_ids, {
                skip_special_tokens: true,
            })

            self.postMessage({
                type: 'update',
                target: data.elementIdToUpdate,
                data: decodedText.trim()
            });
        }
    })
}
