# NPM 腳本文件
# 用於管理 npm 相關操作

# 檢查 npm 版本
check-version() {
    echo "📦 NPM 版本檢查"
    npm --version
    node --version
}

# 清理 npm 緩存
clean-cache() {
    echo "🧹 清理 NPM 緩存"
    npm cache clean --force
}

# 驗證依賴
verify-deps() {
    echo "🔍 驗證依賴"
    npm ls --depth=0
}

# 檢查安全漏洞
audit() {
    echo "🔒 檢查安全漏洞"
    npm audit
}

# 修復安全漏洞
audit-fix() {
    echo "🔧 修復安全漏洞"
    npm audit fix
}

# 生成 package-lock.json
generate-lock() {
    echo "🔒 生成 package-lock.json"
    npm install --package-lock-only
}

# 檢查過期依賴
outdated() {
    echo "📅 檢查過期依賴"
    npm outdated
}

# 更新依賴
update() {
    echo "⬆️ 更新依賴"
    npm update
}

# 完整清理和重新安裝
full-reinstall() {
    echo "🔄 完整重新安裝"
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install
}

# 顯示幫助
help() {
    echo "📚 NPM 管理腳本使用說明"
    echo "check-version    - 檢查 npm 和 node 版本"
    echo "clean-cache     - 清理 npm 緩存"
    echo "verify-deps     - 驗證依賴"
    echo "audit           - 檢查安全漏洞"
    echo "audit-fix       - 修復安全漏洞"
    echo "generate-lock   - 生成 package-lock.json"
    echo "outdated        - 檢查過期依賴"
    echo "update          - 更新依賴"
    echo "full-reinstall  - 完整重新安裝"
    echo "help            - 顯示此幫助信息"
}

# 主函數
case "$1" in
    check-version) check-version ;;
    clean-cache) clean-cache ;;
    verify-deps) verify-deps ;;
    audit) audit ;;
    audit-fix) audit-fix ;;
    generate-lock) generate-lock ;;
    outdated) outdated ;;
    update) update ;;
    full-reinstall) full-reinstall ;;
    help) help ;;
    *) echo "未知命令: $1"; help ;;
esac
