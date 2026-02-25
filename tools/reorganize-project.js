#!/usr/bin/env node

/**
 * RS-System 專案重組自動化腳本
 * 自動執行檔案移動和路徑更新
 */

const fs = require('fs');
const path = require('path');

// 重組配置
const REORGANIZATION_MAP = {
  // 配置檔案移動
  'firebase-config.js': 'src/config/firebase.js',
  'sync-config.js': 'src/config/sync.js',
  
  // 服務檔案移動
  'logger-service.js': 'src/services/logger.js',
  
  // 工具檔案移動
  'sync-utils.js': 'src/utils/sync.js',
  
  // 樣式檔案移動
  'sync-styles.css': 'src/styles/sync.css',
  
  // 向後相容檔案
  'system.js': 'src/compat/system.js',
  
  // 文檔檔案移動
  'Introduction-with problems.pdf': 'docs/assets/Introduction-with-problems.pdf',
  'introduction-with-problem.pdf': 'docs/assets/introduction-with-problem.pdf',
  'LOGIN_SECURITY_AUDIT.md': 'docs/admin/LOGIN_SECURITY_AUDIT.md',
  'MIGRATION.md': 'docs/changelog/MIGRATION.md',
  'PHASE3_COMPLETION_REPORT.md': 'docs/changelog/PHASE3_COMPLETION_REPORT.md',
  'REFACTORING_PLAN.md': 'docs/development/REFACTORING_PLAN.md',
  'TESTING_SETUP_COMPLETE.md': 'docs/development/TESTING_SETUP_COMPLETE.md',
  'security-analysis.html': 'docs/admin/security-analysis.html',
  
  // 工具檔案移動
  'smart_rename_docs.py': 'tools/rename-docs.py',
  'smart_rename_docs_v3_git.py': 'tools/rename-docs-v3.py',
  
  // 測試檔案移動
  'test-integration.html': 'test/integration/test-integration.html',
  'test-modules.html': 'test/unit/test-modules.html',
  'test-phase2-modules.html': 'test/unit/phase2.html',
  'test-phase3-modules.html': 'test/unit/phase3.html',
  'test-phase4-modules.html': 'test/unit/phase4.html',
  'test-results.html': 'test/reports/test-results.html'
};

// 路徑更新規則
const PATH_UPDATE_RULES = [
  // 配置檔案路徑
  {
    pattern: /from ['"]\.\/firebase-config\.js['"]/g,
    replacement: "from './src/config/firebase.js'"
  },
  {
    pattern: /from ['"]\.\/sync-config\.js['"]/g,
    replacement: "from './src/config/sync.js'"
  },
  
  // 服務檔案路徑
  {
    pattern: /from ['"]\.\/logger-service\.js['"]/g,
    replacement: "from './src/services/logger.js'"
  },
  
  // 工具檔案路徑
  {
    pattern: /from ['"]\.\/sync-utils\.js['"]/g,
    replacement: "from './src/utils/sync.js'"
  },
  
  // 樣式檔案路徑
  {
    pattern: /<link[^>]*href=['"]sync-styles\.css['"][^>]*>/g,
    replacement: '<link rel="stylesheet" href="./src/styles/sync.css">'
  },
  
  // 向後相容檔案路徑
  {
    pattern: /<script[^>]*src=['"]system\.js['"][^>]*>/g,
    replacement: '<script src="./src/compat/system.js">'
  }
];

/**
 * 創建目錄（如果不存在）
 */
function ensureDirectoryExists(dirPath) {
  const dir = path.dirname(dirPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ 創建目錄: ${dir}`);
  }
}

/**
 * 移動檔案
 */
function moveFile(source, target) {
  if (!fs.existsSync(source)) {
    console.warn(`⚠️  源檔案不存在: ${source}`);
    return false;
  }
  
  ensureDirectoryExists(target);
  
  try {
    fs.copyFileSync(source, target);
    fs.unlinkSync(source);
    console.log(`📁 移動檔案: ${source} → ${target}`);
    return true;
  } catch (error) {
    console.error(`❌ 移動檔案失敗: ${source} → ${target}`, error);
    return false;
  }
}

/**
 * 更新檔案中的路徑引用
 */
function updateFilePaths(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    PATH_UPDATE_RULES.forEach(rule => {
      const newContent = content.replace(rule.pattern, rule.replacement);
      if (newContent !== content) {
        content = newContent;
        updated = true;
        console.log(`🔧 更新路徑: ${filePath}`);
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (error) {
    console.error(`❌ 更新檔案失敗: ${filePath}`, error);
  }
  
  return false;
}

/**
 * 處理目錄移動
 */
function moveDirectory(source, target) {
  if (!fs.existsSync(source)) {
    console.warn(`⚠️  源目錄不存在: ${source}`);
    return false;
  }
  
  ensureDirectoryExists(target);
  
  try {
    // 遞歸複製目錄
    copyDirectoryRecursive(source, target);
    // 刪除原目錄
    fs.rmSync(source, { recursive: true, force: true });
    console.log(`📁 移動目錄: ${source} → ${target}`);
    return true;
  } catch (error) {
    console.error(`❌ 移動目錄失敗: ${source} → ${target}`, error);
    return false;
  }
}

/**
 * 遞歸複製目錄
 */
function copyDirectoryRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

/**
 * 創建必要的目錄結構
 */
function createDirectoryStructure() {
  const directories = [
    'src/config',
    'src/services',
    'src/utils',
    'src/styles',
    'src/compat',
    'docs/admin',
    'docs/development',
    'docs/changelog',
    'docs/assets',
    'tools',
    'archive',
    'test/unit',
    'test/integration',
    'test/reports'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 創建目錄: ${dir}`);
    }
  });
}

/**
 * 執行重組
 */
function executeReorganization() {
  console.log('🚀 開始執行專案重組...\n');
  
  // 創建目錄結構
  console.log('📂 創建目錄結構...');
  createDirectoryStructure();
  
  // 移動檔案
  console.log('\n📁 移動檔案...');
  let movedFiles = 0;
  Object.entries(REORGANIZATION_MAP).forEach(([source, target]) => {
    if (moveFile(source, target)) {
      movedFiles++;
    }
  });
  
  // 移動目錄
  console.log('\n📁 移動目錄...');
  const directories = [
    { source: 'abc', target: 'archive/abc' },
    { source: 'OLD_TESTS', target: 'archive/OLD_TESTS' }
  ];
  
  let movedDirectories = 0;
  directories.forEach(({ source, target }) => {
    if (moveDirectory(source, target)) {
      movedDirectories++;
    }
  });
  
  // 更新路徑引用
  console.log('\n🔧 更新路徑引用...');
  const filesToUpdate = [
    'index.html',
    'login.html',
    'src/index.js',
    'src/main.js',
    'vitest.config.js'
  ];
  
  let updatedFiles = 0;
  filesToUpdate.forEach(file => {
    if (updateFilePaths(file)) {
      updatedFiles++;
    }
  });
  
  // 總結
  console.log('\n📊 重組完成統計:');
  console.log(`✅ 移動檔案: ${movedFiles}`);
  console.log(`✅ 移動目錄: ${movedDirectories}`);
  console.log(`✅ 更新檔案: ${updatedFiles}`);
  
  console.log('\n🎉 專案重組完成！');
  console.log('⚠️  請執行以下命令驗證:');
  console.log('   npm run test');
  console.log('   npm run build');
  console.log('   npm run dev');
}

/**
 * 顯示幫助信息
 */
function showHelp() {
  console.log(`
RS-System 專案重組工具

用法:
  node tools/reorganize-project.js [選項]

選項:
  --help, -h     顯示此幫助信息
  --dry-run      僅顯示將要執行的操作，不實際執行
  --backup       在重組前創建備份

注意:
  - 此腳本會修改檔案結構，請確保已提交當前更改
  - 建議在執行前先創建 Git 備份
  - 執行後請運行測試確保一切正常
`);
}

/**
 * 檢查前置條件
 */
function checkPrerequisites() {
  // 檢查是否在 Git 倉庫中
  if (!fs.existsSync('.git')) {
    console.warn('⚠️  警告: 當前目錄不是 Git 倉庫');
  }
  
  // 檢查是否有未提交的更改
  try {
    const gitStatus = require('child_process').execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.warn('⚠️  警告: 發現未提交的更改，建議先提交');
    }
  } catch (error) {
    // Git 命令失敗，忽略
  }
}

// 主程序
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--dry-run')) {
    console.log('🔍 模擬模式 - 將執行的操作:');
    Object.entries(REORGANIZATION_MAP).forEach(([source, target]) => {
      console.log(`  移動: ${source} → ${target}`);
    });
    return;
  }
  
  if (args.includes('--backup')) {
    console.log('💾 創建備份...');
    try {
      require('child_process').execSync('git add -A && git commit -m "backup: 重組前自動備份"', { stdio: 'inherit' });
      console.log('✅ 備份完成');
    } catch (error) {
      console.warn('⚠️  備份失敗，繼續執行...');
    }
  }
  
  checkPrerequisites();
  
  if (args.includes('--confirm') || process.env.NODE_ENV === 'development') {
    executeReorganization();
  } else {
    console.log('⚠️  此操作將重組整個專案結構。');
    console.log('請使用 --confirm 參數確認執行，或使用 --help 查看幫助。');
  }
}

// 執行主程序
if (require.main === module) {
  main();
}

module.exports = {
  executeReorganization,
  moveFile,
  updateFilePaths,
  REORGANIZATION_MAP
};
