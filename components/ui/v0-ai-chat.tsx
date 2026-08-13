"use client";

import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowUp,
  Camera,
  ChartNoAxesCombined,
  Check,
  CloudSun,
  Copy,
  Database,
  Paperclip,
  Plus,
  ShieldAlert,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import styles from "./v0-ai-chat.module.css";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface QuickCommand {
  label: string;
  prompt: string;
  icon: ReactNode;
}

const QUICK_COMMANDS: readonly QuickCommand[] = [
  {
    label: "分析当前爆发风险",
    prompt: "分析当前小火蚁爆发风险",
    icon: <ShieldAlert size={15} strokeWidth={1.7} aria-hidden="true" />,
  },
  {
    label: "查看环境信息",
    prompt: "查看当前环境信息",
    icon: <CloudSun size={15} strokeWidth={1.7} aria-hidden="true" />,
  },
  {
    label: "打开田间摄像头",
    prompt: "打开田间摄像头",
    icon: <Camera size={15} strokeWidth={1.7} aria-hidden="true" />,
  },
  {
    label: "汇总今日诱集数据",
    prompt: "汇总今日诱集数据",
    icon: (
      <ChartNoAxesCombined size={15} strokeWidth={1.7} aria-hidden="true" />
    ),
  },
] as const;

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset = false) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = `${minHeight}px`;
      if (reset) return;

      textarea.style.height = `${Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY,
        ),
      )}px`;
    },
    [maxHeight, minHeight],
  );

  useEffect(() => {
    adjustHeight(true);
  }, [adjustHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function createMockResponse(prompt: string) {
  if (prompt.includes("风险") || prompt.includes("爆发")) {
    return "当前监测区域综合风险为中风险。今日诱集数量为 126 只，较昨日同期增加 18 只；温度 26.4°C、相对湿度 71%，环境条件有利于小火蚁活动。建议优先复核诱集量增长最快的监测点。";
  }

  if (prompt.includes("环境") || prompt.includes("温湿度")) {
    return "当前监测区域温度为 26.4°C，相对湿度为 71%。过去一小时温度上升 0.6°C、湿度下降 2%，各监测点数据传输正常。";
  }

  if (prompt.includes("摄像头") || prompt.includes("画面")) {
    return "田间摄像头通道已准备。当前为前端演示状态，接入设备视频服务后，将在此处打开实时画面并支持监测点切换。";
  }

  if (prompt.includes("诱集") || prompt.includes("汇总")) {
    return "当前监测区域今日累计诱集 126 只，最近一次记录时间为 21:00，较昨日同期增加 18 只。田间东侧的增长最明显，建议继续观察夜间变化。";
  }

  return `已收到关于“${prompt}”的请求。当前页面使用模拟监测数据，后续接入 AI 与设备服务后，可在这里返回实时分析结果。`;
}

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRagEnabled, setIsRagEnabled] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const messageIdRef = useRef(0);
  const responseTimerRef = useRef<number | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 62,
    maxHeight: 180,
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    conversationEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [isResponding, messages]);

  useEffect(
    () => () => {
      if (responseTimerRef.current !== null) {
        window.clearTimeout(responseTimerRef.current);
      }
    },
    [],
  );

  const submitPrompt = useCallback(
    (rawPrompt: string) => {
      const prompt = rawPrompt.trim();
      if (!prompt || isResponding) return;

      const userMessage: ChatMessage = {
        id: ++messageIdRef.current,
        role: "user",
        content: prompt,
        timestamp: getCurrentTime(),
        attachments: attachments.map((file) => file.name),
      };

      setMessages((current) => [...current, userMessage]);
      setValue("");
      setAttachments([]);
      setIsResponding(true);
      adjustHeight(true);

      responseTimerRef.current = window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: ++messageIdRef.current,
            role: "assistant",
            content: createMockResponse(prompt),
            timestamp: getCurrentTime(),
          },
        ]);
        setIsResponding(false);
        responseTimerRef.current = null;
      }, 720);
    },
    [adjustHeight, attachments, isResponding],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitPrompt(value);
    }
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, 3);
    setAttachments(nextFiles);
    event.target.value = "";
  }

  function resetConversation() {
    if (responseTimerRef.current !== null) {
      window.clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }

    setMessages([]);
    setValue("");
    setAttachments([]);
    setIsResponding(false);
    adjustHeight(true);
    textareaRef.current?.focus();
  }

  async function copyMessage(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1400);
    } catch {
      setCopiedMessageId(null);
    }
  }

  return (
    <section className={styles.workbench} aria-labelledby="ai-workbench-title">
      <header className={styles.workbenchHeader}>
        <div>
          <p>ANT-VIGIL / INTELLIGENCE</p>
          <h1 id="ai-workbench-title">AI 会话工作台</h1>
        </div>

        <div className={styles.headerActions}>
          <span className={styles.onlineState}>
            <i aria-hidden="true" />
            AI ONLINE
          </span>
          <button
            className={styles.newConversationButton}
            type="button"
            onClick={resetConversation}
            aria-label="新建会话"
            title="新建会话"
          >
            <Plus size={17} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        className={styles.conversation}
        aria-live="polite"
        aria-busy={isResponding}
      >
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.assistantMark} aria-hidden="true">
              <Sparkles size={19} strokeWidth={1.5} />
            </span>
            <h2>今天需要了解什么？</h2>
            <p>12 个监测点已同步 · 最近更新 21:00</p>
          </div>
        ) : (
          <ol className={styles.messageList}>
            {messages.map((message) => (
              <li
                className={`${styles.message} ${
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }`}
                key={message.id}
              >
                <div className={styles.messageBody}>
                  <div className={styles.messageMeta}>
                    {message.role === "assistant" ? (
                      <div className={styles.messageMeta}>
                        <strong>AI 监测助手</strong>
                        <time>{message.timestamp}</time>
                      </div>
                    ) : null}
                  </div>
                  <p>{message.content}</p>

                  {message.attachments && message.attachments.length > 0 ? (
                    <ul className={styles.messageAttachments}>
                      {message.attachments.map((attachment) => (
                        <li key={attachment}>
                          <Paperclip size={11} aria-hidden="true" />
                          {attachment}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {message.role === "assistant" ? (
                    <div className={styles.messageTools}>
                      <button
                        type="button"
                        onClick={() => copyMessage(message)}
                        aria-label="复制回复"
                        title="复制回复"
                      >
                        {copiedMessageId === message.id ? (
                          <Check size={13} aria-hidden="true" />
                        ) : (
                          <Copy size={13} aria-hidden="true" />
                        )}
                      </button>
                      <button type="button" aria-label="回复有帮助" title="有帮助">
                        <ThumbsUp size={13} aria-hidden="true" />
                      </button>
                      <button type="button" aria-label="回复需改进" title="需改进">
                        <ThumbsDown size={13} aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}

            {isResponding ? (
              <li className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.thinking} aria-label="AI 正在分析">
                  <span />
                  <span />
                  <span />
                </div>
              </li>
            ) : null}
          </ol>
        )}
        <div ref={conversationEndRef} />
      </div>

      <div className={styles.composerArea}>
        <form
          className={styles.composer}
          onSubmit={(event) => {
            event.preventDefault();
            submitPrompt(value);
          }}
        >


          {attachments.length > 0 ? (
            <ul className={styles.attachments} aria-label="待发送附件">
              {attachments.map((file) => (
                <li key={`${file.name}-${file.lastModified}`}>
                  <Paperclip size={12} aria-hidden="true" />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter((item) => item !== file),
                      )
                    }
                    aria-label={`移除附件 ${file.name}`}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <Textarea
            ref={textareaRef}
            id="monitoring-ai-prompt"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="我能帮你什么.."
            className={styles.textarea}
            style={{ overflowY: value.length > 0 ? "auto" : "hidden" }}
            disabled={isResponding}
          />

          <div className={styles.composerFooter}>
            <div className={styles.composerTools}>
              <input
                ref={fileInputRef}
                className={styles.fileInput}
                type="file"
                multiple
                accept="image/*,.pdf,.csv"
                onChange={handleFiles}
                tabIndex={-1}
              />
              <button
                className={styles.attachButton}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="添加附件"
                title="添加附件"
              >
                <Paperclip size={16} strokeWidth={1.7} aria-hidden="true" />
              </button>

              <button
                className={`${styles.ragToggle} ${
                  isRagEnabled ? styles.ragToggleActive : ""
                }`}
                type="button"
                aria-pressed={isRagEnabled}
                aria-label={`RAG${isRagEnabled ? "已开启" : "已关闭"}`}
                title={isRagEnabled ? "关闭 RAG" : "开启 RAG"}
                onClick={() => setIsRagEnabled((current) => !current)}
              >
                <Database size={14} strokeWidth={1.7} aria-hidden="true" />
                <span>RAG</span>
              </button>
            </div>

            <button
              className={styles.sendButton}
              type="submit"
              disabled={!value.trim() || isResponding}
              aria-label="发送消息"
              title="发送消息"
            >
              <ArrowUp size={17} strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className={styles.quickCommands} aria-label="常用指令">
          {QUICK_COMMANDS.map((command) => (
            <button
              type="button"
              onClick={() => submitPrompt(command.prompt)}
              disabled={isResponding}
              key={command.prompt}
            >
              {command.icon}
              <span>{command.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
