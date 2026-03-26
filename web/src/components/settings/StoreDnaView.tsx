"use client";

import BrandMemoryView from "./BrandMemoryView";

/**
 * ストアDNA — ブランド/ストアの本質を管理するトップレベルビュー
 *
 * 現在は BrandMemoryView をラップしていますが、
 * 今後 Emotional DNA ヒアリングUIなども統合予定。
 */
export default function StoreDnaView() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 pt-16 pb-14">
        <h1 className="text-3xl font-bold text-foreground mb-2">ストアDNA</h1>
        <p className="text-[15px] text-muted-foreground mb-10">
          Aicataがあなたのストアを深く理解するための情報を管理します
        </p>

        {/* Brand Memory */}
        <div className="mb-12">
          <BrandMemoryView />
        </div>
      </div>
    </div>
  );
}
