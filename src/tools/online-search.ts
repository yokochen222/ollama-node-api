import * as cheerio from 'cheerio'
import { Tool } from 'ollama'


export const desc: Tool = {
  type: 'function',
  function: {
    name: 'OnlineSearch',
    description: '联网查询事物/内容',
    parameters: {
      type: '',
      required: ['keyword'],
      properties: {
        keyword: {
          type: 'string',
          description: "需要查询内容的关键词",
        },
      }
    }
  }
}

export function fetchHtmlDoc(url: string) {
  return fetch(url, {
    method: "get",
  }).then((res) => {
    if (res.statusText.toLowerCase() !== 'ok') {
      return ''
    }
    return res.text()
  })
}

export function searchBing(keyword: string) {
  return fetchHtmlDoc(`https://cn.bing.com/search?q=${keyword}`)
  .then((content) => {
    const $ = cheerio.load(content)
    const a = $('#b_results .b_algo a')
    const links: {
      href: string
      name: string
    }[] = []
    a.each((index, el) => {
      const href = el.attribs['href']
      const text = $(el).text()
      links.push({
        href,
        name: text
      })
    })
    return {
      result: $('#b_results').html(),
      related_links: links
    }
  })
}


export async function OpenApp(args: { [key: string]: string }) {
  const keyword = (args.keyword) + ''.toLowerCase()
  console.log('匹配到联网搜索', keyword)
  const res = await searchBing(keyword)
  if (res.related_links.length) {
    console.log('获取到相关链接：', res.related_links[0].href)
    const html = await fetchHtmlDoc(res.related_links[0].href)
    const $ = cheerio.load(html)
    const content = $('body p').text()
    console.log('获取到网页内容', content)
    
    return content
  }
  return JSON.stringify(res)
}

export default {
  desc,
  toolFn: OpenApp
}