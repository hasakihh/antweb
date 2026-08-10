"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setStatus("当前未连接认证服务");
    }, 700);
  }

  return (
    <div className="auth-panel">
      <div className="auth-heading">
        <div>
          <p>SECURE ACCESS / 01</p>
          <h2>进入监测网络</h2>
        </div>
        <span className="auth-security" title="加密访问">
          <LockKeyhole size={15} strokeWidth={1.7} aria-hidden="true" />
        </span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="username">账号</label>
          <input
            id="username"
            type="text"
            name="username"
            autoComplete="username"
            placeholder="请输入账号"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="password">密码</label>
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
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </div>

        <div className="form-options">
          <label className="remember-option">
            <input type="checkbox" name="remember" />
            <span>保持登录</span>
          </label>
          <span>内部授权用户</span>
        </div>

        <button className="submit-button" type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "正在验证" : "进入监测平台"}</span>
          {isSubmitting ? (
            <LoaderCircle className="submit-spinner" size={17} aria-hidden="true" />
          ) : (
            <ArrowRight size={17} aria-hidden="true" />
          )}
        </button>

        <p className="form-status" role="status" aria-live="polite">
          {status}
        </p>
      </form>
    </div>
  );
}
