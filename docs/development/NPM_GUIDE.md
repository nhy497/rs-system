# NPM 配置文檔
# 詳細說明 NPM 相關配置和使用方法

## 概述
本目錄包含 NPM 相關的配置文件和腳本，用於管理項目的依賴和構建過程。

## 文件說明

### .npmrc
NPM 配置文件，包含：
- Registry 設置
- 認證配置
- 緩存設置
- SSL 配置
- 超時設置

### scripts/npm-utils.sh
NPM 管理腳本，提供以下功能：
- 版本檢查
- 緩存清理
- 依賴驗證
- 安全檢查
- 依賴更新
- 完整重新安裝

## 使用方法

### 基本命令
```bash
# 檢查版本
./scripts/npm-utils.sh check-version

# 清理緩存
./scripts/npm-utils.sh clean-cache

# 驗證依賴
./scripts/npm-utils.sh verify-deps

# 安全檢查
./scripts/npm-utils.sh audit

# 修復安全問題
./scripts/npm-utils.sh audit-fix
```

### 依賴管理
```bash
# 生成 package-lock.json
./scripts/npm-utils.sh generate-lock

# 檢查過期依賴
./scripts/npm-utils.sh outdated

# 更新依賴
./scripts/npm-utils.sh update

# 完整重新安裝
./scripts/npm-utils.sh full-reinstall
```

## 最佳實踐

### 1. 開發環境設置
```bash
# 1. 安裝依賴
npm install

# 2. 生成 package-lock.json
./scripts/npm-utils.sh generate-lock

# 3. 驗證依賴
./scripts/npm-utils.sh verify-deps

# 4. 檢查安全漏洞
./scripts/npm-utils.sh audit
```

### 2. CI/CD 集成
```bash
# 在 CI/CD 中使用
npm ci  # 使用 package-lock.json

# 或使用腳本
./scripts/npm-utils.sh full-reinstall
```

### 3. 維護操作
```bash
# 定期清理緩存
./scripts/npm-utils.sh clean-cache

# 檢查過期依賴
./scripts/npm-utils.sh outdated

# 更新依賴
./scripts/npm-utils.sh update
```

## 環境變量

### NPM_TOKEN
用於私有 registry 認證：
```bash
export NPM_TOKEN=your_token_here
```

### 其他配置
- `HOME`: 用戶主目錄
- `npm_config_cache`: 緩存目錄覆蓋

## 故障排除

### 常見問題
1. **權限錯誤**: 檢查文件權限
2. **網絡問題**: 檢查代理設置
3. **緩存問題**: 清理緩存後重試
4. **版本衝突**: 使用 full-reinstall

### 解決方案
```bash
# 完整重置
./scripts/npm-utils.sh full-reinstall

# 手動清理
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 配置選項

### Registry 配置
```bash
# 使用官方 registry
npm config set registry https://registry.npmjs.org/

# 使用私有 registry
npm config set registry https://npm.company.com/
```

### 緩存配置
```bash
# 設置緩存目錄
npm config set cache /path/to/cache

# 清理緩存
npm cache clean --force
```

## 安全建議

1. **定期審計**: 使用 `npm audit` 檢查漏洞
2. **及時更新**: 保持依賴為最新版本
3. **使用 lock 文件**: 確保構建一致性
4. **限制權限**: 避免使用 sudo 安裝全局包

## 相關文檔
- [NPM 官方文檔](https://docs.npmjs.com/)
- [Package.json 規範](https://docs.npmjs.com/files/package.json)
- [CI/CD 最佳實踐](../deployment/CI_CD_GUIDE.md)
