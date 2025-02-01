import markdownit from 'markdown-it'

const md = markdownit()

md.use(require('markdown-it-highlightjs'))

const markdown = "```\nconst x = 10;\n```";
const html = md.render(markdown);
console.log(html);