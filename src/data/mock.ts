import type { ItemType, LibraryData, LibraryItem } from '../types'

const now = Date.now()
const H = 3_600_000
const D = 24 * H

let seq = 0
const nid = () => `seed-${(++seq).toString(36)}`

function item(type: ItemType, def: Partial<LibraryItem> & { ago: number }): LibraryItem {
  const { ago, ...rest } = def
  const ts = now - ago
  return {
    id: nid(),
    type,
    title: '',
    content: '',
    url: '',
    author: '',
    source: '',
    folderId: null,
    tags: [],
    favorite: false,
    createdAt: ts,
    updatedAt: ts,
    ...rest,
  }
}

export function createMockData(): LibraryData {
  return {
    folders: [
      { id: 'f-copy', name: '文案灵感', parentId: null, createdAt: now - 30 * D },
      { id: 'f-hook', name: '开头钩子', parentId: 'f-copy', createdAt: now - 29 * D },
      { id: 'f-design', name: '设计参考', parentId: null, createdAt: now - 28 * D },
      { id: 'f-read', name: '好文收藏', parentId: null, createdAt: now - 27 * D },
      { id: 'f-comment', name: '神评论', parentId: null, createdAt: now - 26 * D },
    ],
    items: [
      item('text', {
        folderId: 'f-hook',
        title: '数字对比式钩子',
        content: '我删掉了手机里的 47 个 App，才想明白哪些东西是真正需要的。',
        tags: ['钩子', '标题公式'],
        ago: 2 * H,
      }),
      item('text', {
        folderId: 'f-hook',
        content: '你以为的顿悟，可能只是别人的基本功。',
        tags: ['金句', '认知'],
        favorite: true,
        ago: 5 * H,
      }),
      item('text', {
        folderId: 'f-copy',
        content: '生活不是等待暴风雨过去，而是学会在雨中跳舞。',
        tags: ['金句', '治愈'],
        ago: 2 * D,
      }),
      item('text', {
        folderId: 'f-copy',
        title: '周日晚仪式感',
        content:
          '每周日晚上 8 点，是我一周里最期待的时刻。\n不是追剧，也不是刷手机，\n而是给自己泡一杯茶，写下这一周最想记住的三件小事。',
        tags: ['文案', '生活方式'],
        ago: 4 * D,
      }),
      item('text', {
        folderId: 'f-hook',
        title: '比喻式开头',
        content: '如果把内容创作比做开店：标题是招牌，开头是迎宾，干货是菜品，互动是回头客。',
        tags: ['方法论', '写作'],
        favorite: true,
        ago: 6 * D,
      }),
      item('image', {
        folderId: 'f-design',
        title: '山间晨雾',
        url: 'https://picsum.photos/seed/mist-valley/800/1000',
        tags: ['摄影', '竖图'],
        ago: 3 * H,
      }),
      item('image', {
        folderId: 'f-design',
        title: '渐变配色灵感',
        url: 'https://picsum.photos/seed/grad-ab/800/560',
        tags: ['配色', '灵感'],
        ago: 3 * D,
      }),
      item('image', {
        folderId: 'f-design',
        title: '极简排版参考',
        url: 'https://picsum.photos/seed/clean-ui/800/500',
        tags: ['UI', '排版'],
        ago: 8 * D,
      }),
      item('image', {
        folderId: null,
        title: '周五下班的心情',
        url: 'https://picsum.photos/seed/friday-cat/640/640',
        tags: ['表情包'],
        ago: 12 * D,
      }),
      item('link', {
        folderId: 'f-read',
        title: '写作的本质：信息密度与情绪价值',
        url: 'https://zhuanlan.zhihu.com/p/10086',
        tags: ['写作', '干货'],
        ago: 16 * H,
      }),
      item('link', {
        folderId: 'f-read',
        title: '2026 前端趋势：交互设计的 10 个方向',
        url: 'https://juejin.cn/post/idea-store',
        tags: ['前端', '趋势'],
        ago: 5 * D,
      }),
      item('link', {
        folderId: 'f-design',
        title: 'Refactoring UI · 中文精读笔记',
        url: 'https://github.com/refactoring-ui/notes',
        tags: ['设计', '笔记'],
        ago: 9 * D,
      }),
      item('link', {
        folderId: null,
        title: '免费可商用图库合集（持续更新）',
        url: 'https://unsplash.com',
        tags: ['素材', '工具'],
        favorite: true,
        ago: 14 * D,
      }),
      item('comment', {
        folderId: 'f-comment',
        content: '别人稍一注意你，你就敞开心扉，你觉得这是坦率，其实这是孤独。',
        author: '一棵会开花的树',
        source: '网易云音乐',
        tags: ['乐评', '孤独'],
        favorite: true,
        ago: 20 * H,
      }),
      item('comment', {
        folderId: 'f-comment',
        content:
          '小时候枕头上全是口水，长大后枕头上全是泪水；小时候微笑是一种心情，长大后微笑是一种表情。',
        author: '蜡笔不新',
        source: '豆瓣',
        tags: ['影评', '成长'],
        ago: 7 * D,
      }),
      item('comment', {
        folderId: 'f-comment',
        content: '前方高能，请系好安全带，接下来的操作将重新定义「优雅」二字。',
        author: '弹幕君',
        source: 'B站',
        tags: ['弹幕', '搞笑'],
        ago: 11 * D,
      }),
      item('comment', {
        folderId: null,
        content: '收藏从未停止，学习从未开始。',
        author: '匿名网友',
        source: '贴吧',
        tags: ['搞笑', '真实'],
        ago: 18 * D,
      }),
    ],
  }
}
