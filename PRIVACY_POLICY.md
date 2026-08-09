# Privacy Policy for Dinero Tracker

**Application Package:** `com.dinerotracker.com`  
**Effective Date:** August 2026  

---

## 🔒 100% Offline-First & Private Data Guarantee
**Dinero Tracker** (`com.dinerotracker.com`) is engineered on a strict **offline-first, private architecture**. Your incomes, expenses, account balances, budgets, recurring bills, and financial transaction logs remain stored securely and locally on your personal device.

---

## 1. Data Storage & Ownership
All financial records created within **Dinero Tracker**—including transactions, category tags, accounts, budgets, and security PINs—are stored exclusively on your device's local storage (`localStorage` / IndexedDB / native app sandbox). 

We **do not** maintain external database servers to receive, log, or store your personal financial data.

---

## 2. No Personal Data Collection
- **No Account Required:** You do not need to register with a name, email address, or phone number to use the application.
- **No Banking API Scraping:** We do not track or request your sensitive bank login credentials.
- **No Telemetry or Profiling:** We do not collect, monetize, or sell user financial activity, usage patterns, or personal data.

---

## 3. Security & PIN Lock
When you enable the **Security PIN Lock** feature:
- Your numeric PIN is cryptographically hashed and saved locally on your device.
- PIN data is never sent over any network or transmitted to third parties.

---

## 4. Third-Party Services & Network Usage
**Dinero Tracker** operates without mandatory network access. Minimal network calls occur only during specific, user-initiated actions:

- **Live Foreign Exchange Rates:** Exchange rate conversions use central bank APIs (e.g. Frankfurter / European Central Bank). Requests send only standard currency ISO codes (e.g., `USD`, `PHP`). Transaction amounts and financial balances are **never** included.
- **Google Drive Backup & Sync:** If you manually enable Google Drive Sync, backup file payloads are transferred directly between your device and your personal Google Drive account via secure Google APIs.
- **Google Play Billing / In-App Purchases:** Premium upgrades (such as removing ads) are processed securely through standard Google Play Billing API endpoints.

---

## 5. User Data Rights & Erasure
You retain full control over all stored financial records:
- **Export Data:** You can export your full data records as standard JSON or CSV files at any time via App Settings.
- **Complete Erasure:** You can permanently erase all stored accounts, transactions, and settings with one tap using the **Reset App / Clear Data** option in App Settings.

---

## 6. Contact & Support
If you have questions regarding this Privacy Policy or **Dinero Tracker**, please reach out:

- **App Package Name:** `com.dinerotracker.com`
- **Developer Contact:** Support via Google Play Console or App Settings.
