"use client";

import { useState, useCallback, useRef } from "react";
import { Tag, ArrowLeftRight, Trash2, Copy, Check } from "lucide-react";

function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binString);
}

function base64Decode(str: string): string {
  const binString = atob(str);
  const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function looksLikeBase64(str: string): boolean {
  const s = str.trim();
  if (s.length < 4 || s.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]*={0,2}$/.test(s);
}

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [auto, setAuto] = useState(true);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const encode = useCallback(() => {
    setError("");
    if (input === "") {
      setOutput("");
      return;
    }
    try {
      setOutput(base64Encode(input));
    } catch {
      setError("编码失败，输入内容包含无法处理的字符");
    }
  }, [input]);

  const decode = useCallback(() => {
    setError("");
    const text = input.trim();
    if (text === "") {
      setOutput("");
      return;
    }
    try {
      setOutput(base64Decode(text));
    } catch {
      setError("解码失败，输入内容不是有效的 Base64 字符串");
    }
  }, [input]);

  const swap = useCallback(() => {
    setError("");
    setInput(output);
    setOutput(input);
  }, [input, output]);

  const clear = useCallback(() => {
    setError("");
    setInput("");
    setOutput("");
  }, []);

  const autoConvert = useCallback(
    (text: string) => {
      if (!auto) return;
      if (text === "") {
        setOutput("");
        setError("");
        return;
      }
      if (looksLikeBase64(text)) {
        try {
          const decoded = base64Decode(text);
          if (/^[\x20-\x7E\u4e00-\u9fa5\n\r\t]*$/.test(decoded)) {
            setOutput(decoded);
            setError("");
            return;
          }
        } catch {
          /* ignore */
        }
      }
      try {
        setOutput(base64Encode(text));
        setError("");
      } catch {
        /* ignore */
      }
    },
    [auto]
  );

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [output]);

  return (
    <div className="bg-card border border-borderline rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-title">Base64 编解码</h3>
          <p className="text-sm text-muted">支持中文的文本与 Base64 双向转换，纯本地计算</p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="base64-input" className="block text-sm font-medium text-body">输入内容</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => setAuto(e.target.checked)}
                className="accent-primary w-3.5 h-3.5 rounded border-borderline"
              />
              <span>实时转换</span>
            </label>
            <span className="text-xs text-muted tabular-nums">{input.length} 字符</span>
          </div>
        </div>
        <textarea
          id="base64-input"
          rows={5}
          value={input}
          placeholder="在此输入文本或粘贴 Base64 内容..."
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
            autoConvert(e.target.value);
          }}
          className="w-full px-3 py-2.5 rounded-lg bg-app border border-borderline text-body placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y font-mono text-base sm:text-sm leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={encode}
          className="px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-medium transition-all duration-200 hover:bg-primary-hover active:scale-[0.97] min-h-[44px] flex-1 sm:flex-none justify-center inline-flex items-center"
        >
          编码 → Base64
        </button>
        <button
          onClick={decode}
          className="px-4 py-2.5 rounded-lg bg-app border border-borderline text-body text-sm font-medium transition-all duration-200 hover:border-primary hover:text-primary active:scale-[0.97] min-h-[44px] flex-1 sm:flex-none justify-center inline-flex items-center"
        >
          解码 ← Base64
        </button>
        <button
          onClick={swap}
          className="px-4 py-2.5 rounded-lg bg-app border border-borderline text-muted text-sm font-medium transition-all duration-200 hover:border-primary hover:text-primary active:scale-[0.97] min-h-[44px] inline-flex items-center justify-center gap-1.5"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          交换
        </button>
        <button
          onClick={clear}
          className="px-4 py-2 rounded-lg bg-app border border-borderline text-muted text-sm font-medium transition-all duration-200 hover:border-danger hover:text-danger active:scale-[0.97] inline-flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          清空
        </button>
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="base64-output" className="block text-sm font-medium text-body">转换结果</label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted tabular-nums">{output.length} 字符</span>
            <button
              onClick={copyOutput}
              className="text-xs text-muted hover:text-primary transition-colors duration-200 inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制" : "复制"}</span>
            </button>
          </div>
        </div>
        <textarea
          id="base64-output"
          ref={outputRef}
          rows={5}
          readOnly
          value={output}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "base64-error" : undefined}
          placeholder="转换结果将显示在这里..."
          className="w-full px-3 py-2.5 rounded-lg bg-app border border-borderline text-body placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y font-mono text-base sm:text-sm leading-relaxed"
        />
        {error && (
          <p id="base64-error" role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
