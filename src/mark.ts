import markdownit from 'markdown-it'

const md = markdownit()

const markdown = 'This is <b>bold'
const html = md.render(markdown);
console.log(html);