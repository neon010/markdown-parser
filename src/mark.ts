import markdownit from 'markdown-it'

const md = markdownit()

const markdown = `
This is an example: "Smart quotes", 'single quotes', and -- en-dash or --- em-dash.
`
const html = md.render(markdown);
console.log(html);