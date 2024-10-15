import ollama from 'ollama'
import type { Message } from 'ollama'
import OpenApps from './tools/open-apps'
import OnlineSearch from './tools/online-search'

const tools = [
  OpenApps.desc,
  OnlineSearch.desc
]

// 可用的工具集函数列表
const availableFunctions = {
  OpenApp: OpenApps.toolFn,
  OnlineSearch: OnlineSearch.toolFn
}

const main = async (model = 'qwen2.5' ) => {

  const messages: Message[] = [
    {
      role: 'user',
      content: '帮我查询下阿里巴巴集团的资料',
    }
  ]

  const response = await ollama.chat({
    model,
    tools: tools,
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
      const functionResponse = await functionToCall(tool.function.arguments)
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