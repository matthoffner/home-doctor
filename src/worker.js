import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;

// Update task function mapping
const TASK_FUNCTION_MAPPING = {
    'image-to-text': image_to_text,
    'image-classification': image_classification,
    'object-detection': object_detection
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

// Define model factory for object detection
class ObjectDetectionPipelineFactory {
    static task = 'object-detection';
    static model = 'Xenova/detr-resnet-50'; // Model for object detection

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

// Define model factory for image classification
class ImageClassificationPipelineFactory {
    static task = 'image-classification';
    static model = 'Xenova/vit-base-patch16-224'; // Model for image classification

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

async function image_classification(data) {
    let pipeline = await ImageClassificationPipelineFactory.getInstance(data => {
        self.postMessage({
            type: 'download',
            task: 'image-classification',
            data: data
        });
    });

    let outputs = await pipeline(data.image, {
        topk: 5 // return top 5 classifications
    });

    self.postMessage({
        type: 'complete',
        target: data.elementIdToUpdate,
        targetType: data.targetType,
        updateLabels: data.updateLabels,
        data: outputs
    });
}

async function object_detection(data) {
    let pipeline = await ObjectDetectionPipelineFactory.getInstance(data => {
        self.postMessage({
            type: 'download',
            task: 'object-detection',
            data: data
        });
    });

    let outputs = await pipeline(data.image, {
        threshold: 0.9,
        percentage: true
    });

    self.postMessage({
        type: 'complete',
        target: data.elementIdToUpdate,
        targetType: data.targetType,
        chartId: data.chartId,
        data: outputs
    });
}

