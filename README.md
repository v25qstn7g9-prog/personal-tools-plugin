# Personal Tools

Perplexity Computer 的四個私人服務連接器安裝設定。
本儲存庫公開的只有服務名稱、公開端點、安裝說明與設定驗證程式。
不含 API key、登入密碼、OAuth token、持股、訓練資料或私人 App 原始碼。
知道端點網址不代表有權存取資料；各服務仍要求原本的認證。

## 從 GitHub 匯入

在 Perplexity 的「從 GitHub 匯入外掛程式」貼上：

https://github.com/v25qstn7g9-prog/personal-tools-plugin

匯入完成後，確認外掛頁面列出以下四個連接器，再分別連線。
外掛匯入、登入驗證、工具呼叫成功是三個不同階段；本套件的靜態檢查不代表已在使用者的 Perplexity 帳號安裝或啟用。

## 連接器與認證

| 顯示識別 | 服務 | 驗證方式 |
| --- | --- | --- |
| stock-app | 存股 App | OAuth 登入；或在自訂連接器設定以 API Key 使用原有唯讀金鑰 |
| atlas-lab | Atlas Lab | OAuth 登入；或在自訂連接器設定以 API Key 使用原有工具金鑰 |
| si-hub | SI Hub | API Key，填入自己的 SI Hub MCP 金鑰 |
| regwatch | RegWatch | API Key，填入自己的法規唯讀查詢金鑰 |

傳輸均為 Streamable HTTP。SI Hub 的模型呼叫可能產生供應商費用；匯入外掛本身不呼叫模型。
Atlas 的既有工具若包含寫入操作，必須另獲使用者明確授權；安裝不代表授權新增訓練紀錄。
RegWatch 此入口只提供查詢，不提供抓取、寄信或管理功能。

Perplexity 的 Credentials vault 中已儲存的金鑰，不會因此自動填入外掛的連接器授權欄位。
需要時只能在 Perplexity 的私密驗證介面填入，不能提交到本儲存庫、issue 或對話中。
若外掛匯入後的卡片沒有 API Key 選項，請到該連接器的設定查看；若仍不能設定，改用官方的「新增 MCP 連接器」入口，不能把 token 填進公開 URL 來繞過。

## 格式與驗證

`plugin.json` 在根目錄，含名稱、說明與 inline `mcpServers` 定義。
採用遠端 HTTP MCP 設定，不含固定 headers、URL 變數、環境變數或本機 stdio。
根目錄 `mcp.json` 是 Agent Plugins 1.0 相容設定，同名服務與 URL 和 manifest 一致；不含額外服務。

執行 `node --test tests/*.test.mjs` 可檢查端點、檔案白名單、兩份設定一致及常見密鑰洩漏形式。
真正的 Perplexity 匯入結果仍需在帳號介面確認；官方文件沒有提供可公開呼叫的匯入驗證 API。

## 官方文件

- Perplexity 外掛格式、公開 GitHub 匯入與略過條件：
  https://www.perplexity.ai/help-center/en/articles/2026100802-create-or-upload-a-custom-plugin
- 遠端連接器與 OAuth 官方回呼網址：
  https://www.perplexity.ai/help-center/en/articles/13915507-adding-custom-remote-connectors
- Agent Plugins MCP schema：
  https://agent-plugins.org/schemas/1.0.0/mcp.schema.json
