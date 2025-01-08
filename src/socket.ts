import * as mqtt from 'mqtt';
import ws from 'ws'

import { chat } from './llm'

const wsclient = new ws('http://127.0.0.1:8089/ws/transcribe?lang=zh') // 替换为你的WebSocket服务器地址
wsclient.onopen = () => {
    console.log('Connected to WebSocket server.')
}

wsclient.onmessage = async (event) => {
    // 在这里处理从WebSocket服务器接收到的消息
    try {
        const res = JSON.parse(event.data  as string)
        if (res.code === 0) {
            console.log('-----------------------')
            console.log('语音AI解析：', res.data)
            await chat(res.data)
            console.log('-----------------------')
        }
    } catch(e) {
        console.log(e)
    }
}

wsclient.onclose = () => {
    console.log('Disconnected from WebSocket server.');
};

wsclient.onerror = (error) => {
    console.error('WebSocket error observed:', error);
}

// MQTT 客户端配置
const client = mqtt.connect('mqtt://192.168.0.5'); // 替换为实际的MQTT代理地址
client.on('connect', () => {
    console.log('Connected to MQTT broker.');
    client.subscribe('/esp32/moss/audio', { qos: 1 }, (err) => {
        if (err) {
            console.error('Failed to subscribe to /esp32/moss/audio:', err);
        } else {
            console.log('Subscribed to topic /esp32/moss/audio');
        }
    });
});

client.on('message', (topic: string, message: Buffer) => {
    if (topic === '/esp32/moss/audio') {
        processAudioChunk(message)
    }
});


let audioDataBuffer: Buffer = Buffer.alloc(0); // 用于累积音频数据
function processAudioChunk(chunk: Buffer): void {
    if (chunk.length < 4) {
        console.warn('Received invalid chunk, too short.');
        return;
    }
    const audioData = chunk.slice(4); // 获取实际音频数据
    // 累积音频数据
    audioDataBuffer = Buffer.concat([audioDataBuffer, audioData]);
    wsclient.send(audioDataBuffer)
    audioDataBuffer = Buffer.alloc(0); // 清空缓存
}
