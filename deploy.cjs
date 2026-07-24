#!/usr/bin/env node
/* eslint-disable */
// Ozon ERP - 自动部署到 GitHub Pages
// 用法：node deploy.js   或   双击 deploy.bat

const { execSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// 工具：在 stderr 输出日志
const log = (...args) => process.stderr.write(args.join(' ') + '\n');
const die = (msg, code = 1) => { log('❌', msg); process.exit(code); };

// 入口
const ROOT = process.cwd();
const REPO_URL = 'https://github.com/cqx1028/qxERP.git';
const BRANCH = 'gh-pages';

// 1. 构建
log('▶ 步骤 1/4：构建生产版本...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: ROOT });
} catch {
  die('构建失败，请先修复编译错误。');
}

// 检查 dist
const distDir = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  die('dist/index.html 不存在，构建可能失败。');
}

// 2. 创建临时部署目录
const deployDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qxerp-deploy-'));
log(`▶ 步骤 2/4：准备部署目录 ${deployDir}`);

// 3. 复制 dist 到根
log('▶ 步骤 3/4：复制构建产物...');
copyDirSync(distDir, deployDir);
// 加上 .nojekyll（绕过 GitHub Pages 的 Jekyll 处理）
fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');

// 4. 推送到 gh-pages
log(`▶ 步骤 4/4：推送到 ${BRANCH} 分支...`);
try {
  run('git', ['init', '-q'], deployDir);
  run('git', ['config', 'user.name', 'qxerp-deploy'], deployDir);
  run('git', ['config', 'user.email', 'deploy@qxerp.local'], deployDir);
  run('git', ['checkout', '-b', BRANCH, '-q'], deployDir);
  run('git', ['add', '-A'], deployDir);
  run('git', ['commit', '-q', '-m', 'deploy: 自动部署'], deployDir);
  run('git', ['push', REPO_URL, BRANCH, '--force'], deployDir);
} catch (e) {
  cleanup(deployDir);
  die(`推送失败：${e.message}\n请确认 Git 已配置 GitHub 凭据（在弹窗中输入 Personal Access Token）。`);
}

// 5. 清理
cleanup(deployDir);

log('');
log('✅ 部署成功！');
log('');
log('网站地址：https://cqx1028.github.io/qxERP/');
log('');
log('首次部署请到 https://github.com/cqx1028/qxERP/settings/pages');
log('确认 Branch: gh-pages / (root)，然后点 Save。');
log('通常 30 秒 ~ 2 分钟内生效。');
process.exit(0);

// ---------- helpers ----------
function run(cmd, args, cwd) {
  // Windows: 必须显式 .exe 才能 spawnSync 找到；用 shell 方案时直接传字符串
  if (process.platform === 'win32') {
    // 用 shell 模式：把整条命令拼成字符串，让 cmd.exe 自己解析 PATH
    const quoted = args.map(a => /\s/.test(a) ? `"${a}"` : a).join(' ');
    const r = spawnSync(`${cmd} ${quoted}`, { cwd, stdio: 'inherit', shell: true });
    if (r.status !== 0) {
      throw new Error(`${cmd} ${args.join(' ')} exited with code ${r.status}`);
    }
    return;
  }
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: false });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} exited with code ${r.status}`);
  }
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}
