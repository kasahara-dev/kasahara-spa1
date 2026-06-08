import * as React from "react";
import { Copy, Check } from "lucide-react"; // アイコンをインポート

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      // 💡 クリップボードにコピーする魔法の1行！
      await navigator.clipboard.writeText(text);

      // コピー成功したらチェックマークにする
      setCopied(true);

      // 1.5秒後に元のアイコンに戻す
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("コピーに失敗しました", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      title="コピー"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600" /> // コピー成功時
      ) : (
        <Copy className="w-3.5 h-3.5" /> // 通常時
      )}
    </button>
  );
}
