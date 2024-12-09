## 1. ブランチ作成

```bash
# Issue #1用のブランチを作成する場合
git checkout -b backend/issue-1/initial-setup
```

## 2. コミットメッセージ

```bash
# コミットメッセージに #[Issue番号] を含める
git commit -m "chore: initial express setup #1"

# 複数行のコミットメッセージの例npm create vite@latest
git commit -m "feat: setup express and mongodb connection #1

- Install express and dependencies
- Configure TypeScript
- Add MongoDB connection
- Create basic folder structure"
```

### 主なキーワード

コミットメッセージやプルリクエストの説明で使用できる特別なキーワード：

- `#1` - Issue への参照
- `fixes #1` - コミット/PR がマージされた時に Issue を自動的にクローズ
- `closes #1` - 同上
- `resolves #1` - 同上

### コミットメッセージの推奨フォーマット

```
<type>: <description> #<issue-number>

[optional body]
```

type の例

- `feat` - 新機能の追加
- `fix` - バグの修正
- `chore` - ビルドプロセスや補助ツールの変更
- `docs` - ドキュメントのみの変更
- `style` - コードのフォーマットやスタイルの変更（空白、形式、欠落など）
- `refactor` - コードのリファクタリング（バグの修正や機能の追加ではない）
- `perf` - パフォーマンスの改善
- `test` - テストの追加や修正

### 実際の使用例

```bash
# 初期セットアップのコミット
git commit -m "chore: initial project setup #1"

# Express設定のコミット
git commit -m "feat: add express configuration #1"

# MongoDBセットアップのコミット
git commit -m "feat: add mongodb connection #1"

# Issue完了時の最終コミット
git commit -m "feat: complete initial backend setup closes #1"
```

## ブランチの削除

local

```bash
git branch -d <branch-name>
```

remote

```bash
git push origin --delete <branch-name>
```
