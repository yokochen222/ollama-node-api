import * as fs from 'fs';
import * as path from 'path';

// WAV 文件头结构
function createWavHeader(sampleRate: number, bitsPerSample: number, channels: number, dataLength: number): Buffer {
    const blockAlign = (channels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const header = Buffer.alloc(44);

    // RIFF/WAVE Header
    header.write('RIFF', 0);
    header.writeInt32LE(36 + dataLength, 4); // ChunkSize
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeInt32LE(16, 16); // Subchunk1Size
    header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    header.writeUInt16LE(channels, 22); // NumChannels
    header.writeUInt32LE(sampleRate, 24); // SampleRate
    header.writeUInt32LE(byteRate, 28); // ByteRate
    header.writeUInt16LE(blockAlign, 32); // BlockAlign
    header.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
    header.write('data', 36);
    header.writeInt32LE(dataLength, 40); // Subchunk2Size

    return header;
}

let audioDataBuffer: Buffer = Buffer.alloc(0); // 用于累积音频数据
let fileCounter = 0; // 用于生成唯一的文件名
const secondsToSave = 5; // 想要保存的音频长度（秒）
const sampleRate = 16000; // 替换为你的音频采样率
const bitsPerSample = 16; // 替换为你的音频位深
const channels = 1; // 替换为你的音频声道数
const bytesPerSecond = sampleRate * (bitsPerSample / 8) * channels;
const dataLengthFor30Seconds = bytesPerSecond * secondsToSave;

export function sss(chunk: Buffer): void {
    if (chunk.length < 4) {
        console.warn('Received invalid chunk, too short.');
        return;
    }
    const audioData = chunk.slice(4); // 获取实际音频数据
    // 累积音频数据
    audioDataBuffer = Buffer.concat([audioDataBuffer, audioData]);

    // 当累积30秒的数据后，保存为WAV文件
    if (audioDataBuffer.length >= dataLengthFor30Seconds) {
        saveAudioToFile(audioDataBuffer);
        audioDataBuffer = Buffer.alloc(0); // 清空缓存
    }
}

function saveAudioToFile(audioData: Buffer) {
    const header = createWavHeader(sampleRate, bitsPerSample, channels, audioData.length);
    
    const fileName = `audio_${fileCounter++}.wav`;
    const filePath = path.join(__dirname, fileName);
    
    // 创建包含WAV头部和音频数据的完整缓冲区
    const wavFileBuffer = Buffer.concat([header, audioData]);
    
    // 将数据写入文件系统
    // fs.writeFileSync(filePath, wavFileBuffer);
    // console.log(`Saved ${fileName} to disk.`);
}