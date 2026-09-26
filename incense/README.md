# Hoa — Netlify 專用完整版原始碼

這個資料夾是標準 Next.js 專案，已移除 Vinext、Sites、Cloudflare Worker / D1 依賴。
請用這一份完整取代先前上傳的 Sites 原始碼。不要把兩個版本混在一起。

## 1. 上傳與建置

推薦做法：將本資料夾「裡面的全部檔案」放在 Git 儲存庫根目錄，讓 Netlify 連接該儲存庫。
如果你使用支援原始碼建置的上傳流程，也必須上傳完整解壓後的專案，不能只傳 public 或 .next。

根目錄應該直接看見：

- package.json、package-lock.json
- netlify.toml、next.config.ts、tsconfig.json、postcss.config.mjs
- app/、components/、hooks/、lib/、public/
- supabase/schema.sql、.env.example、README.md

Netlify 設定：

- Base directory：留空（若專案放在子目錄，則指定該子目錄）
- Build command：npm run build
- Publish directory：.next
- Node.js：22（netlify.toml 已設定）
- Functions directory：留空，由 Netlify Next.js adapter 處理

使用 Netlify 自動安裝的最新版 Next.js / OpenNext adapter。
不要加入 /* /index.html 200 這類 SPA 轉址，也不要把 publish 改成 public 或 dist。

替換後第一次部署，建議在 Netlify 選擇清除快取後重新部署。
若 log 仍出現 vinext 或 site-creator-vinext-starter，表示還在建置舊版；新版會顯示：

    hoa-netlify@1.0.0 build
    next build --webpack

## 2. 會員、訂單、留言需要設定 Supabase

不設定後端也能成功建置並瀏覽網站；會員區會清楚顯示尚未啟用。
這不等於後端已啟用。請完成下面設定後再開放會員使用。

1. 在你的 Supabase 帳號建立一個專案。
2. 開啟 SQL Editor，把本專案 supabase/schema.sql 的完整內容執行一次。
   這會建立 hoa_members、hoa_orders、hoa_reviews，並啟用資料列安全限制。
3. 在 Supabase 的專案設定取得 Project URL、Publishable key（或舊版 anon key）、Secret key（或舊版 service_role key）。
4. 在 Netlify 的 Environment variables 設定下面三個名稱。
   使用相同 Supabase 專案的三個值，不要放進原始碼，也不要公開 Secret/service_role key。

| 變數 | 值 | 使用範圍 |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Project URL，https://你的專案.supabase.co | Builds + Functions |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable 或 legacy anon key | Builds + Functions |
| SUPABASE_SERVICE_ROLE_KEY | Secret 或 legacy service_role key | Functions（若介面只能選 All scopes 也可） |

不要在私密金鑰名稱前加 NEXT_PUBLIC_。只有上述兩個 public 值會進入瀏覽器。
新增或修改 public 變數後，必須重新建置部署。

5. Supabase Authentication → URL Configuration：
   - Site URL：你的 Netlify 網址，例如 https://你的網站.netlify.app
   - Redirect URLs：加入 https://你的網站.netlify.app/login
   - 換正式網域時，一併更新以上網址。
6. 啟用 Email 登入，建議保留 email confirmation。
   正式對外註冊前，設定自己的 SMTP 寄信服務，確認驗證信可以送達。
7. 重新部署。到 /login 註冊、收信驗證並登入，然後測試會員資料、測試訂單和留言。

## 3. 功能與界線

- 保留繁體中文／越南語、語言記憶、香品介紹、製香動畫和購物袋。
- 會員改為 Supabase 電子郵件／密碼登入，不使用 ChatGPT 登入或可信任的 Sites 專用標頭。
- 訂單價格由伺服器重新計算；訂單與地址只依已驗證會員身分讀取。
- 商品、价格、規格仍為示範。訂單僅為測試訂單。
- MoMo、ZaloPay、VNPAY、轉帳、COD，以及 GHN/GHTK/Viettel Post 仍是未開通的偏好選項。
  真實付款、回調驗簽、退款、運費、叫件與物流追蹤尚未接上商家帳號。
- 舊 Sites 的會員、訂單與留言不會自動移轉；本包沒有任何舊會員或收件資料。
- supabase/schema.sql 禁止匿名或會員透過 Supabase REST 直接讀寫資料表；本站 API 驗證登入後才使用 server-only 金鑰存取。
- 會員留言為公開顯示內容，未驗證是否購買。

## 4. 本機啟動

安裝 Node.js 22.13 以上版本。

    npm ci
    npm run build
    npm start

需要本機測試後端時，把 .env.example 複製成 .env.local，填入你自己的 Supabase 值。
不要把 .env.local 上傳到 Git 或分享。

## 5. 這次修正的原因

舊版的 build 指令執行 Vinext，並引用 .openai/hosting.json 和 build/sites-vite-plugin。
補上這兩個檔案只會修掉第一層錯誤，仍然無法把 Cloudflare Worker/D1 和 Sites 登入直接搬到 Netlify。
這一版已改為 Next.js 原生建置與 Supabase 後端介接；不需要這些 Sites 檔案。

文件依據：
- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- https://supabase.com/docs/reference/javascript/auth-signup
- https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- https://supabase.com/docs/reference/javascript/auth-getuser
- https://supabase.com/docs/guides/database/postgres/row-level-security

## 驗證紀錄

- 本機執行 npm run build 成功（Next.js 16.3.4），包含 TypeScript 檢查。
- 正式建置啟動後，9 個頁面均回傳 200；越南語 cookie 能正常切換伺服器輸出。
- 缺少後端設定時，API 回報 configured=false，拒絕保存訂單；跨來源寫入回傳 403。
- 沒有連接你的 Netlify 或 Supabase 帳號，因此尚未驗證 Netlify 雲端部署、真實註冊驗證信、Supabase 建表及真實會員資料讀寫。
- 新版不包含假會員或假訂單，需由你填入自己的 Supabase 設定後才啟用後端。
