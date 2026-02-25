/**
 * 雲端同步配置
 * 
 * 免費方案選擇：
 * 
 * 【方案 1】IBM Cloudant（推薦）
 *   - 免費額度：1GB 存儲 + 每秒 20 次讀寫
 *   - 設置步驟：見下方「IBM Cloudant 設置指南」
 * 
 * 【方案 2】自架 CouchDB
 *   - 完全免費但需要自己的伺服器
 *   - 適合有技術能力的用戶
 */

const SYNC_CONFIG = {
  // 是否啟用雲端同步
  ENABLE_SYNC: false,
  
  // 遠程數據庫 URL
  // 填入格式：https://username:password@your-instance.cloudantnosqldb.appdomain.cloud/rs-system-shared
  REMOTE_DB_URL: '',
  
  // 同步選項
  OPTIONS: {
    live: true,        // 即時同步
    retry: true,       // 斷線重連
    continuous: true   // 持續同步
  }
};

/*
═══════════════════════════════════════════════════════════════════
  IBM Cloudant 免費設置指南（5 分鐘完成）
═══════════════════════════════════════════════════════════════════

步驟 1️⃣  註冊 IBM Cloud
  → 訪問：https://cloud.ibm.com/registration
  → 填寫郵箱並驗證（不需信用卡）

步驟 2️⃣  創建 Cloudant 服務
  1. 登入後點擊「Catalog」
  2. 搜尋「Cloudant」
  3. 選擇「Lite」方案（免費）
  4. 地區選「Dallas」或最近的
  5. 點擊「Create」

步驟 3️⃣  創建數據庫
  1. 進入 Cloudant 控制台
  2. 點擊「Launch Dashboard」
  3. 點擊「Create Database」
  4. 名稱填：rs-system-shared
  5. 類型選「Non-partitioned」
  6. 點擊「Create」

步驟 4️⃣  生成憑證
  1. 回到 IBM Cloud 控制台
  2. 選擇你的 Cloudant 服務
  3. 點擊「Service credentials」
  4. 點擊「New credential」
  5. 選擇「Use legacy credentials」（重要！）
  6. 點擊「Add」

步驟 5️⃣  取得連接 URL
  1. 點開剛建立的憑證
  2. 複製 "url" 的值（類似下方格式）：
     https://abc123-xxx:longpassword@abc123-xxx.cloudantnosqldb.appdomain.cloud
  3. 在 URL 後面加上 /rs-system-shared
  
  完整範例：
  https://abc123:pass@abc123.cloudantnosqldb.appdomain.cloud/rs-system-shared

步驟 6️⃣  填入配置
  將上方 ENABLE_SYNC 改為 true
  將完整 URL 填入 REMOTE_DB_URL

步驟 7️⃣  啟用 CORS（重要！）
  1. 在 Cloudant Dashboard 點擊右上角齒輪
  2. 選擇「CORS」
  3. 選擇「All domains (*)」
  4. 點擊「Save Changes」

完成！重新整理頁面即可開始同步。

═══════════════════════════════════════════════════════════════════
*/
