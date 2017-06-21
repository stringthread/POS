文化祭等、購入者が限定される場面での使用のために作られた簡易POSシステムです
販売品目とデコは table.js 中のそれぞれ item_table、deco_table 配列でバーコードと紐づけしています
バーコードリーダーは入力前後にTabを入力するよう設定してください
購入履歴の管理にPHPとMySQLを使用しています。実行はPHP対応サーバーから行ってください。POSデータベースを作成し、その中にlogテーブルを作ってください
SQL文：CREATE TABLE POS.log (id INT NOT NULL,item VARCHAR(255) NOT NULL,deco INT NOT NULL,date TIMESTAMP);
