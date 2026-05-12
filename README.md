# Kashikari Tracker

借りた金額を記録して、未返済の重さを可視化するためのフロントエンドです。  
借金が残っている間は暗く沈んだ雰囲気、返済時や完済時はパチンコ風の派手な演出に切り替わります。

## Features

- 借入と返済の履歴管理
- 未返済総額、借りた総額、返した総額の表示
- 返済相手のオートコンプリート
- 完済時のフィーバー演出
- 返済時に走る `777` / `COMPLETE` オーバーレイ
- `localStorage` によるローカル保存

## Tech Stack

- React 19
- Vite 8
- Plain CSS

## Getting Started

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いて確認できます。

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- データはブラウザの `localStorage` に保存されます。
- バックエンドや認証はまだありません。
- 演出を強めているので、点滅表現が苦手な環境では調整が必要です。
