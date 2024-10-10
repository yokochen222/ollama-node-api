import type { Tool } from 'ollama'

const tools: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'openApps',
      description: '打开电脑中的应用',
      parameters: {
        type: '',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description: "想要打开的应用名称",
          }
        }
      }
    }
  }
]
