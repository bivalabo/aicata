-- BIVALABO 開発用データベース初期化
-- Docker初回起動時に自動実行される

-- Aicata用DB（docker-compose.ymlで自動作成済み）
-- 追加のDB作成が必要な場合はここに記述

-- 将来の追加アプリ用DB
-- CREATE DATABASE bivalabo_app2;
-- CREATE DATABASE bivalabo_app3;

-- 開発用のロケール設定
ALTER DATABASE aicata SET timezone TO 'Asia/Tokyo';
