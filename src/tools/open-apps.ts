import type { Tool } from 'ollama'
import shelljs from 'shelljs'
export const desc: Tool = {
  type: 'function',
  function: {
    name: 'OpenApp',
    description: '打开电脑中的应用',
    parameters: {
      type: '',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: "需要打开的应用名称",
        },
        url: {
          type: 'string',
          description: '需要打开浏览器访问的域名地址'
        },
      }
    }
  }
}

const browsers = ['浏览器', 'chrome', 'http', 'https', '.com', '.cn', '.top']

export function OpenApp(args: { [key: string]: string }) {
  const appName = (args.name) + ''.toLowerCase()
  const url = (args.url) + ''.toLowerCase()

  console.log('获取到工具调用参数', args)
  console.log('获取到工具调用', appName)
  console.log('获取到工具调用参数URL', url)

  if (browsers.includes(appName) || url) {
    shelljs.exec(`open -a "/Applications/Google Chrome.app" "${url}"`, (code, stdout, err) => {
      console.log('shell 脚本执行代码: ', code)
      console.log('shell 脚本执行标准输出: ', stdout)
      console.log('shell 脚本执行错误信息: ', err || '无错误')
    })
  }

  // return { error: "没有找到应用" }
  return JSON.stringify({ success: "应用已经打开" })
}
