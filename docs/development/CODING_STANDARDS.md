# 🎨 編碼規範

---

## 📝 JavaScript 規範

### 命名約定
- **變量**: camelCase (`userName`, `recordList`)
- **常量**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RECORDS`)
- **函數**: camelCase (`saveRecord()`, `loadData()`)
- **類別**: PascalCase (`RecordManager`, `DataService`)

### 代碼風格
```javascript
// 好：使用 const/let
const userName = 'John';
let recordCount = 0;

// 好：使用箭頭函數
const formatDate = (date) => {
  return date.toISOString();
};

// 好：清晰的註釋
/**
 * 保存課程記錄
 * @param {Object} record - 課程記錄物件
 * @returns {boolean} 保存成功與否
 */
function saveRecord(record) {
  // ...
}
```

---

## 🏛️ HTML 規範

- 使用語義化標籤
- 添加適當的 ARIA 標籤
- ID 使用 kebab-case
- Class 使用 kebab-case

---

## 🎨 CSS 規範

- 使用 BEM 命名約定
- 優先使用 CSS 變量
- 移動優先 (Mobile-first)

---

## 📚 相關文檔

- [💻 開發指南](./DEVELOPER_GUIDE.md)
- [🤝 貢獻指南](./CONTRIBUTION.md)

---

**注意**: 本文檔持續更新中。
