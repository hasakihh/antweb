"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { defaultMonitoringOverview } from "@/lib/monitoring/monitoring-overview-data";

export interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  attachments?: string[];
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function createMockResponse(prompt: string) {
  const { antCount, antCountDelta, humidity, latestRecordedAt, riskScore, temperature, temperatureDelta, humidityDelta } = defaultMonitoringOverview;
  if (prompt.includes("风险") || prompt.includes("爆发")) {
    return `当前监测区域综合风险为${riskScore >= 65 ? "中高风险" : "中风险"}。今日诱集数量为 ${antCount} 只，较昨日同期增加 ${antCountDelta} 只；温度 ${temperature}°C、相对湿度 ${humidity}%，环境条件有利于小火蚁活动。建议优先复核诱集量增长最快的监测点。`;
  }
  if (prompt.includes("环境") || prompt.includes("温湿度")) {
    return `当前监测区域温度为 ${temperature}°C，相对湿度为 ${humidity}%。过去一小时温度上升 ${temperatureDelta ?? 0}°C、湿度变化 ${humidityDelta ?? 0}%，各监测点数据传输正常。`;
  }
  if (prompt.includes("摄像头") || prompt.includes("画面")) {
    return "田间摄像头通道已准备。当前为前端演示状态，接入设备视频服务后，将在此处打开实时画面并支持监测点切换。";
  }
  if (prompt.includes("诱集") || prompt.includes("汇总")) {
    return `当前监测区域今日累计诱集 ${antCount} 只，最近一次记录时间为 ${latestRecordedAt}，较昨日同期增加 ${antCountDelta} 只。田间东侧的增长最明显，建议继续观察夜间变化。`;
  }
  return `已收到关于“${prompt}”的请求。当前页面使用模拟监测数据，后续接入 AI 与设备服务后，可在这里返回实时分析结果。`;
}

export function useAiChatSession({ resetComposer }: { resetComposer: () => void }) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRagEnabled, setIsRagEnabled] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const messageIdRef = useRef(0);
  const responseTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (responseTimerRef.current !== null) window.clearTimeout(responseTimerRef.current);
  }, []);

  const submitPrompt = useCallback((rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt || isResponding) return;
    setMessages((current) => [...current, { id: ++messageIdRef.current, role: "user", content: prompt, timestamp: getCurrentTime(), attachments: attachments.map((file) => file.name) }]);
    setValue("");
    setAttachments([]);
    setIsResponding(true);
    resetComposer();
    responseTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, { id: ++messageIdRef.current, role: "assistant", content: createMockResponse(prompt), timestamp: getCurrentTime() }]);
      setIsResponding(false);
      responseTimerRef.current = null;
    }, 720);
  }, [attachments, isResponding, resetComposer]);

  const resetConversation = useCallback(() => {
    if (responseTimerRef.current !== null) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = null;
    setMessages([]);
    setValue("");
    setAttachments([]);
    setIsResponding(false);
    resetComposer();
  }, [resetComposer]);

  const copyMessage = useCallback(async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1400);
    } catch {
      setCopiedMessageId(null);
    }
  }, []);

  return { attachments, copiedMessageId, copyMessage, isRagEnabled, isResponding, messages, resetConversation, setAttachments, setIsRagEnabled, setValue, submitPrompt, value };
}
