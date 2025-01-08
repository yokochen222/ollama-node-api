import ollama from 'ollama'
import type { Message } from 'ollama'
import OpenApps from './tools/open-apps'
// import OnlineSearch from './tools/online-search'

const tools = [
  OpenApps.desc,
  // OnlineSearch.desc
]

// 可用的工具集函数列表
const availableFunctions = {
  OpenApp: OpenApps.toolFn,
  // OnlineSearch: OnlineSearch.toolFn
}

const messages:Message [] = []
let response: any
export const chat = async (question: string, model = 'qwen2.5' ) => {
  if (response) {
    response.abort()
    response = undefined
  }
  messages.push({
    role: 'user',
    content: question,
  })

  response = await ollama.chat({
    model,
    tools: tools,
    messages,
    stream: true
  })
  console.log('AI回答：\r')
  if (response) {
    try {
      for await (const message of response) {
        if (message.message.tool_calls) {
          for (const tool of message.message.tool_calls) {
            const functionToCall = availableFunctions[tool.function.name as keyof typeof availableFunctions] 
            const functionResponse = await functionToCall(tool.function.arguments)
            // 将工具函数结果回传到对话上下文
            messages.push({
              role: 'tool',
              content: functionResponse,
            })
            break
          }
        }
      }
    } catch {
        
    }
  }

  response = await ollama.chat({
    model,
    stream: true,
    messages: messages,
  })
  if (response) {
    const assistant = {
      role: 'assistant',
      content: ''
    }
    try {
      for await (const message of response) {
        process.stdout.write(`${message.message.content || ''} `)
        assistant.content += message.message.content
      }
      messages.push(assistant)
      console.log('\n')
    }
    catch {
      
    }
  }
}
