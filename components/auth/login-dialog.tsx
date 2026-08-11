"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginDialog() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    window.setTimeout(() => {
      router.replace("/overview");
    }, 700);
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="get-started-button" type="button">
          <span>Get Started</span>
          <ArrowRight size={24} strokeWidth={2} aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="login-overlay" />
        <Dialog.Content className="login-dialog">
          <Dialog.Close className="dialog-close" aria-label="关闭登录窗口" title="关闭">
            <X size={19} aria-hidden="true" />
          </Dialog.Close>

          <div className="dialog-heading">
            <p>SECURE ACCESS / 01</p>
            <Dialog.Title>欢迎回来</Dialog.Title>
            <Dialog.Description className="dialog-description">
              登录您的监测账户
            </Dialog.Description>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="email">邮箱</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="field-group">
              <div className="password-label-row">
                <label htmlFor="password">密码</label>
                <button
                  type="button"
                  onClick={() => setStatus("请联系系统管理员重置密码")}
                >
                  忘记密码？
                </button>
              </div>
              <span className="password-field">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  title={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </div>

            <button className="submit-button" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "正在验证" : "登录"}</span>
              {isSubmitting ? (
                <LoaderCircle className="submit-spinner" size={18} aria-hidden="true" />
              ) : (
                <ArrowRight size={18} aria-hidden="true" />
              )}
            </button>

            <div className="auth-divider" aria-hidden="true">
              <span />
              <small>SECURE CONNECTION</small>
              <span />
            </div>

            <p className="auth-caption">仅限授权监测人员</p>
            <p className="form-status" role="status" aria-live="polite">
              {status}
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
