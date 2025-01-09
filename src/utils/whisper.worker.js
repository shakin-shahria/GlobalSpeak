import { pipeline } from '@xenova/transformers';
import { MessageTypes } from './presets';

class MyTranscriptionPipeline {
    static task = 'automatic-speech-recognition';
    static model = 'openai/whisper-tiny.en';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            console.log('Initializing Whisper pipeline...');
            try {
                this.instance = await pipeline(this.task, this.model, { progress_callback });
                console.log('Whisper pipeline initialized successfully.');
            } catch (error) {
                console.error('Error initializing Whisper pipeline:', error.message);
                throw error;  // Throw error to be handled in transcribeAudio
            }
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, audio } = event.data;
    if (type === MessageTypes.INFERENCE_REQUEST) {
        console.log('Received audio data for transcription');
        await transcribeAudio(audio);
    }
});

// Function to process audio and perform transcription
async function transcribeAudio(audio) {
    sendLoadingMessage('loading');

    let pipelineInstance;
    try {
        console.log('Getting Whisper pipeline instance...');
        pipelineInstance = await MyTranscriptionPipeline.getInstance(load_model_callback);
        console.log('Whisper pipeline instance obtained:', pipelineInstance);
    } catch (err) {
        console.error('Error during pipeline initialization:', err.message);
        sendLoadingMessage('error');
        self.postMessage({ type: MessageTypes.ERROR, message: 'Pipeline initialization failed' });  // Send error message to main thread
        return;
    }

    if (!pipelineInstance) {
        console.error('Pipeline instance is undefined.');
        sendLoadingMessage('error');
        self.postMessage({ type: MessageTypes.ERROR, message: 'Pipeline instance is undefined' });  // Send error message to main thread
        return;
    }

    sendLoadingMessage('success');
    const stride_length_s = 5;
    const generationTracker = new GenerationTracker(pipelineInstance, stride_length_s);

    try {
        console.log('Starting transcription...');
        await pipelineInstance(audio, {
            top_k: 0,
            do_sample: false,
            chunk_length: 30,
            stride_length_s,
            return_timestamps: true,
            callback_function: generationTracker.callbackFunction.bind(generationTracker),
            chunk_callback: generationTracker.chunkCallback.bind(generationTracker),
        });
        generationTracker.sendFinalResult();
    } catch (err) {
        console.error('Error during transcription:', err.message);
        sendLoadingMessage('error');
        self.postMessage({ type: MessageTypes.ERROR, message: 'Error during transcription' });  // Send error message to main thread
    }
}

// Callback for tracking model progress
async function load_model_callback(data) {
    const { status } = data;
    if (status === 'progress') {
        const { file, progress, loaded, total } = data;
        sendDownloadingMessage(file, progress, loaded, total);
    }
}

// Function to send loading status
function sendLoadingMessage(status) {
    self.postMessage({
        type: MessageTypes.LOADING,
        status,
    });
}

// Function to send downloading progress
async function sendDownloadingMessage(file, progress, loaded, total) {
    self.postMessage({
        type: MessageTypes.DOWNLOADING,
        file,
        progress,
        loaded,
        total,
    });
}

// Generation tracking class for transcription progress
class GenerationTracker {
    constructor(pipeline, stride_length_s) {
        this.pipeline = pipeline;
        this.stride_length_s = stride_length_s;
        this.chunks = [];
        this.time_precision = pipeline?.processor.feature_extractor.config.chunk_length / pipeline.model.config.max_source_positions;
        this.processed_chunks = [];
        this.callbackFunctionCounter = 0;
    }

    sendFinalResult() {
        console.log("Sending final result...");
        self.postMessage({ type: MessageTypes.INFERENCE_DONE });  // Notify the main thread that transcription is done
    }

    callbackFunction(beams) {
        this.callbackFunctionCounter += 1;
        if (this.callbackFunctionCounter % 10 !== 0) {
            return;
        }

        const bestBeam = beams[0];
        let text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
            skip_special_tokens: true,
        });

        const result = {
            text,
            start: this.getLastChunkTimestamp(),
            end: undefined,
        };

        createPartialResultMessage(result);
    }

    chunkCallback(data) {
        this.chunks.push(data);
        const [text, { chunks }] = this.pipeline.tokenizer._decode_asr(this.chunks, {
            time_precision: this.time_precision,
            return_timestamps: true,
            force_full_sequence: false,
        });

        this.processed_chunks = chunks.map((chunk, index) => {
            return this.processChunk(chunk, index);
        });

        createResultMessage(this.processed_chunks, false, this.getLastChunkTimestamp());
    }

    getLastChunkTimestamp() {
        if (this.processed_chunks.length === 0) {
            return 0;
        }
        return this.processed_chunks[this.processed_chunks.length - 1]?.end || 0;
    }

    processChunk(chunk, index) {
        const { text, timestamp } = chunk;
        const [start, end] = timestamp;

        return {
            index,
            text: `${text.trim()}`,
            start: Math.round(start),
            end: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s),
        };
    }
}

// Function to create the final result message
function createResultMessage(results, isDone, completedUntilTimestamp) {
    self.postMessage({
        type: MessageTypes.RESULT,
        results,
        isDone,
        completedUntilTimestamp,
    });
}

// Function to create the partial result message
function createPartialResultMessage(result) {
    self.postMessage({
        type: MessageTypes.RESULT_PARTIAL,
        result,
    });
}
