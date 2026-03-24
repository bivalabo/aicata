"use client";

import { motion } from "framer-motion";
import { Monitor, ExternalLink, Sparkles } from "lucide-react";
import { memo, useCallback } from "react";

interface PageCompleteActionsProps {
  html: string;
  css: string;
  /** プレビューパネルをデスクトップモードに拡大 */
  onExpandDesktop?: () => void;
  /** 新しいウィンドウで開く */
  onOpenNewWindow?: () => void;
}

function buildFullHtmlForNewWindow(html: string, css: string): string {
  // link タグの抽出
  const linkRegex = /<link[^>]*>/gi;
  const links: string[] = [];
  const bodyHtml = html.replace(linkRegex, (match) => {
    links.push(match);
    return "";
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${links.join("\n")}
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif; line-height: 1.6; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; height: auto; display: block; }
a { text-decoration: none; color: inherit; }
${css}
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export default memo(function PageCompleteActions({
  html,
  css,
  onExpandDesktop,
  onOpenNewWindow,
}: PageCompleteActionsProps) {
  const handleOpenNewWindow = useCallback(() => {
    if (onOpenNewWindow) {
      onOpenNewWindow();
      return;
    }
    // フォールバック: 直接新規ウィンドウで開く
    const fullHtml = buildFullHtmlForNewWindow(html, css);
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [html, css, onOpenNewWindow]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {/* デスクトップでプレビュー */}
      {onExpandDesktop && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExpandDesktop}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] text-white text-[13px] font-medium shadow-md shadow-[#7c5cfc]/20 hover:shadow-lg hover:shadow-[#7c5cfc]/30 transition-shadow"
        >
          <Monitor className="w-4 h-4" />
          デスクトップでプレビュー
        </motion.button>
      )}

      {/* 新しいウィンドウで開く */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpenNewWindow}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-border/60 text-foreground/80 text-[13px] font-medium hover:bg-white/90 transition-colors shadow-sm"
      >
        <ExternalLink className="w-4 h-4" />
        フルスクリーンで確認
      </motion.button>
    </motion.div>
  );
});
