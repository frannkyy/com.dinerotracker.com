import { Account, Category, Transaction } from '../types';
import { formatCurrency, formatDateString } from './formatters';

export function exportTransactionsToCSV(
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[]
) {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['Date', 'Type', 'Amount', 'Currency', 'Account', 'Transfer To', 'Category', 'Merchant/Payee', 'Notes', 'Tags'];

  const rows = transactions.map((tx) => [
    tx.date,
    tx.type.toUpperCase(),
    tx.amount,
    tx.currency || 'PHP',
    `"${accountMap.get(tx.accountId) || tx.accountId}"`,
    tx.toAccountId ? `"${accountMap.get(tx.toAccountId) || tx.toAccountId}"` : '',
    `"${categoryMap.get(tx.categoryId) || tx.categoryId}"`,
    `"${(tx.payeeOrMerchant || '').replace(/"/g, '""')}"`,
    `"${(tx.note || '').replace(/"/g, '""')}"`,
    `"${(tx.tags || []).join(' ')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Dinero_Tracker_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDFReportPrint(
  title: string,
  accounts: Account[],
  transactions: Transaction[],
  categories: Category[]
) {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and view the report PDF.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Dinero Tracker - ${title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
            padding: 0 0 30px 0;
            color: #0f172a;
            background: #f8fafc;
            -webkit-font-smoothing: antialiased;
          }
          .header-bar {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            z-index: 1000;
            margin-bottom: 20px;
          }
          .btn {
            padding: 10px 16px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            font-weight: 700;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            text-decoration: none;
            transition: all 0.2s;
            flex: 1;
            max-width: 200px;
            text-align: center;
          }
          .btn-primary {
            background: #2563eb;
            color: #ffffff;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
          }
          .btn-primary:active { transform: scale(0.96); }
          .btn-close {
            background: #f1f5f9;
            color: #334155;
            border: 1px solid #cbd5e1;
          }
          .btn-close:active { transform: scale(0.96); }
          .container {
            width: 100%;
            max-width: 720px;
            margin: 0 auto;
            padding: 0 16px;
          }
          .app-brand {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e2e8f0;
          }
          .brand-title { color: #0f172a; font-size: 20px; font-weight: 900; letter-spacing: -0.02em; }
          .report-tag { background: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
          .subtitle { color: #64748b; font-size: 12px; margin-bottom: 16px; font-weight: 500; }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 12px 14px;
            background: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          }
          .card-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 4px; }
          .card-value { font-size: 17px; font-weight: 800; color: #0f172a; word-break: break-all; }
          
          .section-heading { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 20px; margin-bottom: 8px; }
          .table-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
          }
          table { width: 100%; border-collapse: collapse; min-width: 500px; }
          th { background: #f8fafc; text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; }
          td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #334155; }
          tr:last-child td { border-bottom: none; }
          .badge { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; display: inline-block; }
          .badge-income { color: #15803d; background: #dcfce7; }
          .badge-expense { color: #b91c1c; background: #fee2e2; }
          .badge-transfer { color: #1d4ed8; background: #dbeafe; }
          
          @media print {
            body { background: #ffffff; padding: 0; }
            .no-print { display: none !important; }
            .container { max-width: 100%; padding: 0; }
            .table-wrapper { border: none; }
            .card { border: 1px solid #cbd5e1; }
          }
        </style>
      </head>
      <body>
        <div class="no-print header-bar">
          <button onclick="window.close()" class="btn btn-close">
            ✕ Close & Return
          </button>
          <button onclick="window.print()" class="btn btn-primary">
            🖨 Print / Save PDF
          </button>
        </div>

        <div class="container">
          <div class="app-brand">
            <div>
              <div class="brand-title">Dinero Tracker</div>
              <div class="subtitle" style="margin-bottom:0;">Official Financial Statement</div>
            </div>
            <span class="report-tag">${title}</span>
          </div>

          <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</div>

          <div class="summary-grid">
            <div class="card">
              <div class="card-title">Total Net Worth</div>
              <div class="card-value">${formatCurrency(netWorth)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Assets</div>
              <div class="card-value" style="color: #16a34a;">${formatCurrency(totalAssets)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Liabilities</div>
              <div class="card-value" style="color: #dc2626;">${formatCurrency(totalLiabilities)}</div>
            </div>
          </div>

          <div class="section-heading">Recent Transactions Log (${transactions.length} items)</div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Account</th>
                  <th>Category</th>
                  <th>Payee / Note</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${transactions
                  .slice(0, 50)
                  .map(
                    (tx) => `
                  <tr>
                    <td style="white-space: nowrap;">${formatDateString(tx.date)}</td>
                    <td><span class="badge badge-${tx.type}">${tx.type}</span></td>
                    <td style="font-weight: 600;">${accountMap.get(tx.accountId) || 'Account'}</td>
                    <td>${categoryMap.get(tx.categoryId) || 'Category'}</td>
                    <td>${tx.payeeOrMerchant || tx.note || '-'}</td>
                    <td style="text-align: right; font-weight: 800;">
                      ${tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}${formatCurrency(tx.amount, tx.currency)}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function generateSingleTransactionReceiptPrint(
  tx: Transaction,
  account?: Account,
  category?: Category,
  toAccount?: Account
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to view and print receipt.');
    return;
  }

  const isIncome = tx.type === 'income';
  const isExpense = tx.type === 'expense';
  const amountStr = `${isIncome ? '+' : isExpense ? '-' : ''}${formatCurrency(tx.amount, tx.currency)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Dinero Receipt - ${tx.payeeOrMerchant || 'Transaction'}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            padding: 0 0 30px 0;
            -webkit-font-smoothing: antialiased;
          }
          .header-bar {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            z-index: 1000;
            margin-bottom: 20px;
          }
          .btn {
            padding: 10px 16px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            font-weight: 700;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
            flex: 1;
            max-width: 200px;
          }
          .btn-primary { background: #2563eb; color: #ffffff; }
          .btn-close { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
          .receipt-card {
            max-width: 420px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
            padding: 24px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.04);
          }
          .app-logo { text-align: center; font-size: 18px; font-weight: 900; color: #2563eb; margin-bottom: 2px; }
          .receipt-label { text-align: center; font-size: 11px; text-transform: uppercase; tracking: 1px; color: #64748b; font-weight: 700; margin-bottom: 16px; }
          .amount-box {
            text-align: center;
            padding: 16px;
            background: ${isIncome ? '#f0fdf4' : isExpense ? '#fef2f2' : '#eff6ff'};
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .amount-val {
            font-size: 28px;
            font-weight: 900;
            color: ${isIncome ? '#16a34a' : isExpense ? '#0f172a' : '#2563eb'};
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
          }
          .info-label { color: #64748b; font-weight: 500; }
          .info-val { font-weight: 700; color: #0f172a; text-align: right; }
          .receipt-img {
            width: 100%;
            border-radius: 16px;
            margin-top: 16px;
            border: 1px solid #e2e8f0;
          }
          @media print {
            body { background: #ffffff; padding: 0; }
            .no-print { display: none !important; }
            .receipt-card { border: none; box-shadow: none; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="no-print header-bar">
          <button onclick="window.close()" class="btn btn-close">
            ✕ Close & Return
          </button>
          <button onclick="window.print()" class="btn btn-primary">
            🖨 Print Receipt
          </button>
        </div>

        <div class="receipt-card">
          <div class="app-logo">Dinero Tracker</div>
          <div class="receipt-label">Official Digital Transaction Voucher</div>

          <div class="amount-box">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">${tx.type.toUpperCase()}</div>
            <div class="amount-val">${amountStr}</div>
          </div>

          <div class="info-row">
            <span class="info-label">Payee / Merchant</span>
            <span class="info-val">${tx.payeeOrMerchant || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Account</span>
            <span class="info-val">${account?.name || 'Account'}${toAccount ? ` → ${toAccount.name}` : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Category</span>
            <span class="info-val">${category?.name || 'Category'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date & Time</span>
            <span class="info-val">${formatDateString(tx.date)}</span>
          </div>
          ${
            tx.note
              ? `
          <div class="info-row">
            <span class="info-label">Notes</span>
            <span class="info-val">${tx.note}</span>
          </div>
          `
              : ''
          }
          ${
            tx.tags && tx.tags.length > 0
              ? `
          <div class="info-row">
            <span class="info-label">Tags</span>
            <span class="info-val">${tx.tags.join(' ')}</span>
          </div>
          `
              : ''
          }
          <div class="info-row" style="border-bottom: none;">
            <span class="info-label">Reference ID</span>
            <span class="info-val" style="font-family: monospace; font-size: 11px;">#${tx.id.slice(-8).toUpperCase()}</span>
          </div>

          ${tx.receiptUrl ? `<img src="${tx.receiptUrl}" class="receipt-img" alt="Attached Receipt" />` : ''}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function downloadJSONBackup(data: object, filename?: string) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = filename || `Dinero_Backup_${dateStr}.json`;
  const jsonStr = JSON.stringify(data, null, 2);

  try {
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.setAttribute('download', name);
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 2000);
  } catch (e) {
    console.warn('Blob URL download failed, trying Data URI fallback:', e);
    // Data URI fallback for Android WebViews / restricted IFrames
    const encodedData = encodeURIComponent(jsonStr);
    const dataUrl = `data:application/json;charset=utf-8,${encodedData}`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);
  }
}

export async function saveJSONWithPicker(data: object, filename?: string): Promise<{ success: boolean; jsonStr: string }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = filename || `Dinero_Backup_${dateStr}.json`;
  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Desktop Chromium File System Access API
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: name,
        types: [
          {
            description: 'JSON Database Backup',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonStr);
      await writable.close();
      return { success: true, jsonStr };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, jsonStr }; // User canceled save dialog
      }
      console.warn('File picker error, trying share fallback:', err);
    }
  }

  // 2. Mobile/Android Native Share Sheet (opens Android system folder & drive picker)
  try {
    const file = new File([jsonStr], name, { type: 'application/json' });
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Dinero Financial Backup',
        text: 'Save Dinero backup to any folder, SD card, or Google Drive',
        files: [file],
      });
      return { success: true, jsonStr };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, jsonStr }; // User dismissed share sheet
    }
    console.warn('Share error, falling back to download:', err);
  }

  // 3. Fallback to standard download
  downloadJSONBackup(data, name);
  return { success: true, jsonStr };
}

export async function shareJSONBackup(data: object, filename?: string): Promise<boolean> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = filename || `Dinero_Backup_${dateStr}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  const file = new File([jsonStr], name, { type: 'application/json' });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Dinero Financial Backup',
        text: 'Dinero Tracker JSON database backup file',
        files: [file],
      });
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return false; // User dismissed share sheet
      }
      console.warn('Share error:', err);
    }
  }

  return false;
}
