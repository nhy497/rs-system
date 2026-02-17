# RS-System 模組化架構

## 目錄結構

```
src/
├── constants/          # 常數定義
│   └── app-constants.js
├── utils/              # 工具函數
│   ├── dom-utils.js    # DOM 操作
│   ├── helpers.js      # 通用輔助
│   ├── formatters.js   # 格式化工具
│   └── validators.js   # 驗證工具
└── examples/           # 使用範例
    └── usage-example.js
```

## 使用方式

### ES Module 導入

```javascript
import { STORAGE_KEY } from './constants/app-constants.js';
import { $, $q } from './utils/dom-utils.js';
import { toast } from './utils/helpers.js';
```

### 瀏覽器使用

```html
<script type="module">
  import { toast } from './src/utils/helpers.js';
  toast('Hello!', 'success');
</script>
```

## 下一步

- 階段 2: 提取核心服務 (STORAGE_MANAGER, LOGIN_MANAGER)
- 階段 3: 提取數據服務層
- 階段 4: 提取 UI 管理層
