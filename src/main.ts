import ollama from 'ollama'
import type { Tool } from 'ollama'


const tools: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'getCurrentWeather',
      description: '获取当前天气情况',
      parameters: {
        type: '',
        required: [],
        properties: {
          city: {
            type: 'string',
            description: "想要了解天气情况的城市名称",
          }
        }
      }
    }
  }
]


const main = () => {
  ollama.chat({
    model: 'qwen2.5',
    tools: tools,
    messages: [{ role: 'user', content: '在图片中你看到了什么？'}],
    
  }).then((res) => {
    console.log(res)
    if (res.message.tool_calls) {
      ollama.embed
      console.log(res.message.tool_calls[0].function)
      console.log(res.message.tool_calls[0].function.arguments)
    }
  })
}

main()