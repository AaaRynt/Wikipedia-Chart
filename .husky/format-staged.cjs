const { spawnSync } = require('node:child_process')

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options })
  if (result.error) throw result.error
  return result
}

const staged = run('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'])
if (staged.status !== 0) {
  process.stderr.write(staged.stderr)
  process.exit(staged.status || 1)
}

const files = staged.stdout.split('\0').filter(Boolean)
if (files.length === 0) process.exit(0)

const paths = files.map((file) => `:(literal)${file}`)
const unstaged = run('git', ['diff', '--quiet', '--', ...paths])
if (unstaged.status !== 0) {
  console.error('暂存文件中有未暂存的修改，请先暂存或保存这些修改后再提交。')
  if (unstaged.stderr) process.stderr.write(unstaged.stderr)
  process.exit(1)
}

const formatted = run('pnpm', ['exec', 'oxfmt', '--write', ...files.map((file) => `./${file}`)], { stdio: 'inherit' })
if (formatted.status !== 0) process.exit(formatted.status || 1)

const added = run('git', ['add', '--', ...paths], { stdio: 'inherit' })
if (added.status !== 0) process.exit(added.status || 1)
