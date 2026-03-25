import { useEffect, useRef, useState, useCallback } from "react";

export interface SectionBounds {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SectionMessage {
  type: "section-bounds";
  sections: SectionBounds[];
}

/**
 * iframeとのポストメッセージ通信でセクション情報を取得するフック
 */
export function useIframeSections(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  const [sections, setSections] = useState<Map<string, SectionBounds>>(new Map());
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  // セクション情報をリクエストする
  const requestSections = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "request-sections" },
        "*"
      );
    }
  }, [iframeRef]);

  // スクロール・リサイズイベントを購読
  const subscribeToIframeEvents = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;

    try {
      const iframeDoc = iframeRef.current.contentDocument;
      if (!iframeDoc) return;

      const handleScroll = () => requestSections();
      const handleResize = () => requestSections();

      iframeDoc.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleResize);

      return () => {
        iframeDoc.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
      };
    } catch (e) {
      // iframeへのアクセスがブロックされる可能性がある
      console.warn("Could not subscribe to iframe events:", e);
    }
  }, [iframeRef, requestSections]);

  // メッセージリスナーのセットアップ
  useEffect(() => {
    messageListenerRef.current = (event: MessageEvent) => {
      if (event.data?.type === "section-bounds") {
        const message = event.data as SectionMessage;
        const newSections = new Map<string, SectionBounds>();
        message.sections.forEach((section) => {
          newSections.set(section.id, section);
        });
        setSections(newSections);
      }
    };

    window.addEventListener("message", messageListenerRef.current);
    return () => {
      if (messageListenerRef.current) {
        window.removeEventListener("message", messageListenerRef.current);
      }
    };
  }, []);

  // iframeが読み込まれたときのセットアップ
  useEffect(() => {
    if (!iframeRef.current) return;

    let unsubscribe: (() => void) | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleLoad = () => {
      // 前回のリスナーをクリーンアップ
      unsubscribe?.();
      if (timeoutId) clearTimeout(timeoutId);

      // 少し遅延させて、iframeが完全に読み込まれるのを待つ
      timeoutId = setTimeout(() => {
        requestSections();
        unsubscribe = subscribeToIframeEvents();
      }, 100);
    };

    const iframe = iframeRef.current;
    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, [iframeRef, requestSections, subscribeToIframeEvents]);

  return {
    sections,
    requestSections,
  };
}

/**
 * iframe内で実行されるセクション検出スクリプト
 * buildFullHtml に注入される
 */
export function getSectionDetectionScript(): string {
  return `
(function() {
  function getSectionBounds() {
    const sections = document.querySelectorAll('[data-section-id]');
    return Array.from(sections).map(el => {
      const rect = el.getBoundingClientRect();
      const id = el.getAttribute('data-section-id') || '';
      return {
        id,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    });
  }

  window.addEventListener('message', (event) => {
    // ── Security: Only accept messages from same origin ──
    if (event.origin !== window.location.origin) return;

    if (event.data?.type === 'request-sections') {
      const sections = getSectionBounds();
      parent.postMessage(
        {
          type: 'section-bounds',
          sections: sections,
        },
        '*'
      );
    }
    if (event.data?.type === 'scrollToSection' && event.data.sectionId) {
      const el = document.querySelector('[data-section-id="' + event.data.sectionId + '"]');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    // ── Incremental update: bodyのみ差し替え（フルリロード回避） ──
    if (event.data?.type === 'update-content') {
      var newBody = event.data.body;
      var newCss = event.data.css;
      if (newBody !== undefined) {
        document.body.innerHTML = newBody;
      }
      if (newCss !== undefined) {
        var aiStyle = document.getElementById('aicata-ai-css');
        if (aiStyle) {
          aiStyle.textContent = newCss;
        }
      }
      // 更新後にセクション情報を再送信
      setTimeout(function() {
        var sections = getSectionBounds();
        parent.postMessage({ type: 'section-bounds', sections: sections }, '*');
      }, 50);
    }
  });

  // 初期送信
  window.addEventListener('load', () => {
    setTimeout(() => {
      const sections = getSectionBounds();
      parent.postMessage(
        {
          type: 'section-bounds',
          sections: sections,
        },
        '*'
      );
    }, 100);
  });
})();
  `.trim();
}
