const fs = require('fs');
const path = require('path');

// Build file tree dynamically, excluding system directories
function buildTree(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];
  for (const item of items) {
    // Skip system and hidden directories
    if (item.name === '.git' || item.name === '.github' || item.name === '.claude' || item.name === 'node_modules') continue;
    if (item.name.startsWith('.') && item.name !== '.') continue;
    // Skip the generated index.html itself to avoid stale data
    if (item.name === 'index.html' || item.name === 'server.js' || item.name === 'scripts') continue;
    const fullPath = path.join(dir, item.name);
    const relativePath = fullPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
    if (item.isDirectory()) {
      result.push({
        name: item.name,
        path: relativePath,
        type: 'folder',
        children: buildTree(fullPath)
      });
    } else {
      result.push({
        name: item.name,
        path: relativePath,
        type: 'file'
      });
    }
  }
  return result;
}

// HTML template with embedded data
function generateHTML(data) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>资料合集</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
  <style>
    :root {
      --md-sys-color-primary: #6750A4;
      --md-sys-color-primary-container: #EADDFF;
      --md-sys-color-on-primary-container: #21005D;
      --md-sys-color-secondary: #625B71;
      --md-sys-color-secondary-container: #E8DEF8;
      --md-sys-color-surface: #FFFBFE;
      --md-sys-color-surface-variant: #E7E0EC;
      --md-sys-color-background: #FFFBFE;
      --md-sys-color-on-surface: #1C1B1F;
      --md-sys-color-on-surface-variant: #49454F;
      --md-sys-color-outline: #79747E;
      --md-sys-color-outline-variant: #CAC4D0;
      --md-sys-elevation-1: 0px 1px 3px 1px rgba(0,0,0,0.15), 0px 1px 2px 0px rgba(0,0,0,0.3);
      --md-sys-elevation-2: 0px 2px 6px 2px rgba(0,0,0,0.15), 0px 1px 2px 0px rgba(0,0,0,0.3);
      --md-sys-elevation-3: 0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px 0px rgba(0,0,0,0.3);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Roboto', 'Noto Sans SC', sans-serif;
      background-color: var(--md-sys-color-background);
      color: var(--md-sys-color-on-surface);
      min-height: 100vh;
      line-height: 1.5;
    }
    .app-bar {
      position: fixed; top: 0; left: 0; right: 0; height: 64px;
      background-color: var(--md-sys-color-surface);
      box-shadow: var(--md-sys-elevation-2);
      display: flex; align-items: center; padding: 0 16px; z-index: 100; gap: 16px;
    }
    .app-bar .logo {
      display: flex; align-items: center; gap: 12px;
      font-size: 1.25rem; font-weight: 500; color: var(--md-sys-color-on-surface); text-decoration: none;
    }
    .app-bar .logo .material-icons-round { font-size: 28px; color: var(--md-sys-color-primary); }
    .search-container { flex: 1; max-width: 600px; position: relative; }
    .search-container input {
      width: 100%; height: 48px; border-radius: 28px; border: 1px solid var(--md-sys-color-outline-variant);
      background-color: var(--md-sys-color-surface-variant); padding: 0 16px 0 48px;
      font-size: 1rem; font-family: inherit; color: var(--md-sys-color-on-surface); outline: none; transition: all 0.2s ease;
    }
    .search-container input:focus { border-color: var(--md-sys-color-primary); background-color: var(--md-sys-color-surface); }
    .search-container .material-icons-round { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--md-sys-color-on-surface-variant); pointer-events: none; }
    .main-content { padding: 88px 16px 32px; max-width: 1400px; margin: 0 auto; min-height: 100vh; }
    .breadcrumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; min-height: 24px; }
    .breadcrumb-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); }
    .breadcrumb-item a { color: var(--md-sys-color-primary); text-decoration: none; font-weight: 500; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background 0.15s; }
    .breadcrumb-item a:hover { background-color: var(--md-sys-color-primary-container); }
    .breadcrumb-item.current { color: var(--md-sys-color-on-surface); font-weight: 500; padding: 4px 8px; }
    .section-title { font-size: 1.5rem; font-weight: 400; color: var(--md-sys-color-on-surface); margin-bottom: 16px; letter-spacing: 0.015em; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .md-card {
      background-color: var(--md-sys-color-surface); border-radius: 12px; box-shadow: var(--md-sys-elevation-1);
      overflow: hidden; cursor: pointer; transition: box-shadow 0.2s ease, transform 0.15s ease;
      text-decoration: none; color: inherit; display: flex; flex-direction: column; position: relative;
    }
    .md-card:hover { box-shadow: var(--md-sys-elevation-3); transform: translateY(-2px); }
    .md-card:active { transform: translateY(0); }
    .card-header { padding: 16px 16px 8px; display: flex; align-items: flex-start; gap: 16px; }
    .card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .card-icon.folder { background-color: #E8DEF8; color: #6750A4; }
    .card-icon.pdf { background-color: #F9DEDC; color: #B3261E; }
    .card-icon.doc { background-color: #E0EFFF; color: #00639B; }
    .card-icon.ppt { background-color: #FFF2DF; color: #8C4F00; }
    .card-icon.img { background-color: #E6F5E6; color: #2E7D32; }
    .card-icon.zip { background-color: #F3E5F5; color: #7B1FA2; }
    .card-icon.txt { background-color: #F5F5F5; color: #616161; }
    .card-icon.default { background-color: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); }
    .card-icon .material-icons-round { font-size: 24px; }
    .card-content { flex: 1; min-width: 0; }
    .card-title { font-size: 1rem; font-weight: 500; color: var(--md-sys-color-on-surface); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.4; }
    .card-subtitle { font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-list-container { background-color: var(--md-sys-color-surface); border-radius: 16px; box-shadow: var(--md-sys-elevation-1); overflow: hidden; }
    .file-list { padding: 8px; }
    .list-item { display: flex; align-items: center; gap: 16px; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit; }
    .list-item:hover { background-color: var(--md-sys-color-surface-variant); }
    .list-item-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .list-item-content { flex: 1; min-width: 0; }
    .list-item-title { font-size: 0.95rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .list-item-subtitle { font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin-top: 2px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 16px; text-align: center; color: var(--md-sys-color-on-surface-variant); }
    .empty-state .material-icons-round { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { font-size: 1.25rem; font-weight: 500; margin-bottom: 8px; color: var(--md-sys-color-on-surface); }
    .fab { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 16px; background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); border: none; box-shadow: var(--md-sys-elevation-3); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 90; transition: box-shadow 0.2s, transform 0.15s; }
    .fab:hover { box-shadow: 0px 6px 10px 4px rgba(0,0,0,0.15), 0px 2px 3px 0px rgba(0,0,0,0.3); transform: translateY(-2px); }
    .fab:active { transform: translateY(0); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @media (max-width: 600px) {
      .app-bar { padding: 0 12px; gap: 8px; }
      .app-bar .logo span:not(.material-icons-round) { display: none; }
      .search-container input { height: 40px; font-size: 0.875rem; }
      .main-content { padding: 76px 12px 24px; }
      .card-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
    }
  </style>
</head>
<body>
  <header class="app-bar">
    <a href="#" class="logo" onclick="app.goHome(); return false;">
      <span class="material-icons-round">folder_open</span>
      <span>资料合集</span>
    </a>
    <div class="search-container">
      <span class="material-icons-round">search</span>
      <input type="text" id="searchInput" placeholder="搜索文件或文件夹..." oninput="app.handleSearch(this.value)">
    </div>
  </header>
  <main class="main-content" id="mainContent"></main>
  <button class="fab" id="scrollTopBtn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" style="display: none;">
    <span class="material-icons-round">arrow_upward</span>
  </button>
  <script>
    const FILE_TREE = ${JSON.stringify(data)};
    class App {
      constructor() {
        this.currentPath = '';
        this.searchQuery = '';
        this.flatList = [];
        this.init();
      }
      init() {
        this.buildFlatList(FILE_TREE, '');
        window.addEventListener('scroll', () => {
          document.getElementById('scrollTopBtn').style.display = window.scrollY > 300 ? 'flex' : 'none';
        });
        this.render();
      }
      buildFlatList(items, parentPath) {
        for (const item of items) {
          this.flatList.push({ ...item, parentPath });
          if (item.children) this.buildFlatList(item.children, item.path);
        }
      }
      goHome() { this.currentPath = ''; this.searchQuery = ''; document.getElementById('searchInput').value = ''; this.render(); window.scrollTo({top: 0, behavior: 'smooth'}); }
      navigateTo(path) { this.currentPath = path; this.render(); window.scrollTo({top: 0, behavior: 'smooth'}); }
      handleSearch(query) { this.searchQuery = query.trim().toLowerCase(); this.render(); }
      getFileIcon(name) {
        const ext = name.split('.').pop().toLowerCase();
        switch(ext) {
          case 'pdf': return {icon:'picture_as_pdf',class:'pdf'};
          case 'doc': case 'docx': return {icon:'description',class:'doc'};
          case 'ppt': case 'pptx': return {icon:'slideshow',class:'ppt'};
          case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': case 'bmp': return {icon:'image',class:'img'};
          case 'zip': case 'rar': case '7z': return {icon:'folder_zip',class:'zip'};
          case 'txt': case 'md': return {icon:'article',class:'txt'};
          case 'xls': case 'xlsx': return {icon:'table_chart',class:'doc'};
          case 'html': case 'htm': return {icon:'code',class:'txt'};
          default: return {icon:'insert_drive_file',class:'default'};
        }
      }
      getFileCount(item) {
        if (item.type === 'file') return 0;
        let c = 0;
        for (const ch of (item.children || [])) {
          if (ch.type === 'file') c++;
          else c += this.getFileCount(ch);
        }
        return c;
      }
      getFolderCount(item) {
        if (item.type === 'file') return 0;
        let c = 0;
        for (const ch of (item.children || [])) {
          if (ch.type === 'folder') { c++; c += this.getFolderCount(ch); }
        }
        return c;
      }
      renderBreadcrumbs(path) {
        if (!path) return '';
        const parts = path.split('/');
        let html = '<nav class="breadcrumbs"><div class="breadcrumb-item"><a onclick="app.goHome()">首页</a></div><span style="color:var(--md-sys-color-outline-variant);">›</span>';
        let bp = '';
        for (let i = 0; i < parts.length; i++) {
          bp = bp ? bp + '/' + parts[i] : parts[i];
          if (i < parts.length - 1) {
            html += '<div class="breadcrumb-item"><a onclick="app.navigateTo(\\'' + bp + '\\')">' + parts[i] + '</a></div><span style="color:var(--md-sys-color-outline-variant);">›</span>';
          } else {
            html += '<div class="breadcrumb-item current">' + parts[i] + '</div>';
          }
        }
        html += '</nav>';
        return html;
      }
      renderCard(item) {
        if (item.type === 'folder') {
          const fc = this.getFileCount(item);
          const fdc = this.getFolderCount(item);
          return '<div class="md-card fade-in" onclick="app.navigateTo(\\'' + item.path + '\\')"><div class="card-header"><div class="card-icon folder"><span class="material-icons-round">folder</span></div><div class="card-content"><div class="card-title">' + item.name + '</div><div class="card-subtitle">' + (fc > 0 ? fc + ' 个文件' : '') + (fdc > 0 ? (fc > 0 ? ' · ' : '') + fdc + ' 个子文件夹' : '') + '</div></div></div></div>';
        } else {
          const ic = this.getFileIcon(item.name);
          return '<a href="' + item.path + '" class="md-card fade-in" target="_blank"><div class="card-header"><div class="card-icon ' + ic.class + '"><span class="material-icons-round">' + ic.icon + '</span></div><div class="card-content"><div class="card-title">' + item.name + '</div><div class="card-subtitle">' + item.path + '</div></div></div></a>';
        }
      }
      renderListItem(item) {
        if (item.type === 'folder') {
          const fc = this.getFileCount(item);
          const fdc = this.getFolderCount(item);
          return '<div class="list-item fade-in" onclick="app.navigateTo(\\'' + item.path + '\\')"><div class="list-item-icon folder"><span class="material-icons-round">folder</span></div><div class="list-item-content"><div class="list-item-title">' + item.name + '</div><div class="list-item-subtitle">' + (fc > 0 ? fc + ' 个文件' : '') + (fdc > 0 ? (fc > 0 ? ' · ' : '') + fdc + ' 个子文件夹' : '') + '</div></div><span class="material-icons-round" style="color:var(--md-sys-color-outline);">chevron_right</span></div>';
        } else {
          const ic = this.getFileIcon(item.name);
          return '<a href="' + item.path + '" class="list-item fade-in" target="_blank"><div class="list-item-icon ' + ic.class + '"><span class="material-icons-round">' + ic.icon + '</span></div><div class="list-item-content"><div class="list-item-title">' + item.name + '</div><div class="list-item-subtitle">' + item.path + '</div></div><span class="material-icons-round" style="color:var(--md-sys-color-outline);">open_in_new</span></a>';
        }
      }
      renderSearchResults() {
        const results = this.flatList.filter(i => i.name.toLowerCase().includes(this.searchQuery));
        if (results.length === 0) return '<div class="empty-state"><span class="material-icons-round">search_off</span><h3>未找到结果</h3><p>尝试使用其他关键词搜索</p></div>';
        const folders = results.filter(r => r.type === 'folder');
        const files = results.filter(r => r.type === 'file');
        let html = '<div class="section-title">搜索结果: ' + results.length + ' 个匹配</div>';
        if (folders.length > 0) {
          html += '<h3 style="font-size:0.875rem;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin:16px 0 8px;">文件夹</h3><div class="card-grid">';
          for (const i of folders) html += this.renderCard(i);
          html += '</div>';
        }
        if (files.length > 0) {
          html += '<h3 style="font-size:0.875rem;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin:24px 0 8px;">文件</h3><div class="file-list-container"><div class="file-list">';
          for (const i of files) html += this.renderListItem(i);
          html += '</div></div>';
        }
        return html;
      }
      renderFolderView(items, path) {
        const folders = items.filter(i => i.type === 'folder');
        const files = items.filter(i => i.type === 'file');
        let html = this.renderBreadcrumbs(path);
        if (folders.length === 0 && files.length === 0) {
          html += '<div class="empty-state"><span class="material-icons-round">folder_open</span><h3>空文件夹</h3><p>此文件夹中没有内容</p></div>';
          return html;
        }
        if (folders.length > 0) {
          html += '<div class="section-title">文件夹 (' + folders.length + ')</div><div class="card-grid">';
          for (const i of folders) html += this.renderCard(i);
          html += '</div>';
        }
        if (files.length > 0) {
          html += '<div class="section-title" style="margin-top:32px;">文件 (' + files.length + ')</div><div class="file-list-container"><div class="file-list">';
          for (const i of files) html += this.renderListItem(i);
          html += '</div></div>';
        }
        return html;
      }
      renderHome() {
        const items = FILE_TREE;
        const folders = items.filter(i => i.type === 'folder');
        const files = items.filter(i => i.type === 'file');
        let html = '<div class="section-title">所有学科</div><div class="card-grid">';
        for (const i of folders) html += this.renderCard(i);
        html += '</div>';
        if (files.length > 0) {
          html += '<div class="section-title" style="margin-top:32px;">根目录文件</div><div class="file-list-container"><div class="file-list">';
          for (const i of files) html += this.renderListItem(i);
          html += '</div></div>';
        }
        return html;
      }
      findItemsByPath(path) {
        if (!path) return FILE_TREE;
        const parts = path.split('/');
        let current = FILE_TREE;
        for (const part of parts) {
          const found = current.find(i => i.name === part && i.type === 'folder');
          if (!found) return [];
          current = found.children || [];
        }
        return current;
      }
      render() {
        const container = document.getElementById('mainContent');
        if (this.searchQuery) { container.innerHTML = this.renderSearchResults(); return; }
        if (!this.currentPath) { container.innerHTML = this.renderHome(); return; }
        const items = this.findItemsByPath(this.currentPath);
        container.innerHTML = this.renderFolderView(items, this.currentPath);
      }
    }
    const app = new App();
  </script>
</body>
</html>`;
}

// Main
console.log('🔍 扫描文件目录...');
const tree = buildTree('.');
console.log('📁 发现 ' + tree.length + ' 个顶级项目');

console.log('📝 生成 index.html...');
const html = generateHTML(tree);
fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ 完成! index.html 已更新。');
