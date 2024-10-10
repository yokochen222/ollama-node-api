import ollama from 'ollama'
import type { Message } from 'ollama'
import { OpenApp, desc } from './tools/open-apps'

// 可用的工具集函数列表
const availableFunctions = {
  OpenApp,
}

const main = async (model = 'qwen2.5' ) => {

  const messages: Message[] = [
    {
      role: 'user',
      content: '访问开林集团(https://kailinjt.com)的网页',
    }
  ]

  const response = await ollama.chat({
    model,
    tools: [desc],
    messages,
  })

  messages.push(response.message)

  if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
    console.log("没有需要匹配本地工具的对话:")
    console.log(response.message.content)
    return
  }

  if (response.message.tool_calls) {
    for (const tool of response.message.tool_calls) {
      const functionToCall = availableFunctions[tool.function.name as keyof typeof availableFunctions]
      const functionResponse = functionToCall(tool.function.arguments)
      // 将工具函数结果回传到对话上下文
      messages.push({
        role: 'tool',
        content: functionResponse,
      })
    }
  }

  const finalResponse = await ollama.chat({
    model,
    messages: messages,
  })

  console.log(finalResponse.message.content)
}

main()