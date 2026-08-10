"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Radar,
} from "lucide-react";
import {
  type ComponentProps,
  type FormEvent,
  type PointerEvent,
  useState,
} from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("auth-card-input", className)}
      {...props}
    />
  );
}

type FocusedField = "identity" | "password" | null;

export function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useTransform(
    pointerY,
    [-240, 240],
    reduceMotion ? [0, 0] : [4, -4],
  );
  const rotateY = useTransform(
    pointerX,
    [-240, 240],
    reduceMotion ? [0, 0] : [-4, 4],
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(event.clientX - bounds.left - bounds.width / 2);
    pointerY.set(event.clientY - bounds.top - bounds.height / 2);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setStatus("当前未连接认证服务");
    }, 900);
  }

  return (
    <motion.div
      className="auth-card-shell"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="auth-card-tilt"
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="auth-card-aura" aria-hidden="true" />
        <span className="auth-card-edge auth-card-edge-top" aria-hidden="true" />
        <span className="auth-card-edge auth-card-edge-right" aria-hidden="true" />
        <span className="auth-card-edge auth-card-edge-bottom" aria-hidden="true" />
        <span className="auth-card-edge auth-card-edge-left" aria-hidden="true" />

        <section className="auth-card" aria-labelledby="sign-in-heading">
          <div className="auth-card-pattern" aria-hidden="true" />

          <header className="auth-card-header">
            <motion.span
              className="auth-card-logo"
              initial={reduceMotion ? false : { scale: 0.72, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              aria-hidden="true"
            >
              <Radar size={20} strokeWidth={1.7} />
            </motion.span>
            <div>
              <h2 id="sign-in-heading">欢迎回来</h2>
              <p>登录后进入小火蚁智能监测平台</p>
            </div>
          </header>

          <form className="auth-card-form" onSubmit={handleSubmit}>
            <div className="auth-card-fields">
              <motion.div
                className={cn(
                  "auth-card-field",
                  focusedField === "identity" && "is-focused",
                )}
                whileHover={reduceMotion ? undefined : { scale: 1.006 }}
              >
                <label className="sr-only" htmlFor="identity">
                  账号或邮箱
                </label>
                <Mail aria-hidden="true" size={17} strokeWidth={1.7} />
                <Input
                  id="identity"
                  name="identity"
                  type="text"
                  autoComplete="username"
                  placeholder="账号或邮箱"
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                  onFocus={() => setFocusedField("identity")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </motion.div>

              <motion.div
                className={cn(
                  "auth-card-field",
                  focusedField === "password" && "is-focused",
                )}
                whileHover={reduceMotion ? undefined : { scale: 1.006 }}
              >
                <label className="sr-only" htmlFor="sign-in-password">
                  密码
                </label>
                <LockKeyhole aria-hidden="true" size={17} strokeWidth={1.7} />
                <Input
                  id="sign-in-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="密码"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button
                  className="auth-card-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" size={17} strokeWidth={1.7} />
                  ) : (
                    <Eye aria-hidden="true" size={17} strokeWidth={1.7} />
                  )}
                </button>
              </motion.div>
            </div>

            <div className="auth-card-options">
              <label className="auth-card-remember" htmlFor="remember-me">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((checked) => !checked)}
                />
                <span>保持登录</span>
              </label>
              <button
                className="auth-card-text-button"
                type="button"
                onClick={() => setStatus("请联系系统管理员重置密码")}
              >
                忘记密码？
              </button>
            </div>

            <motion.button
              className="auth-card-submit"
              type="submit"
              disabled={isLoading}
              whileHover={reduceMotion ? undefined : { scale: 1.012 }}
              whileTap={reduceMotion ? undefined : { scale: 0.988 }}
            >
              <AnimatePresence initial={false} mode="wait">
                {isLoading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="auth-card-button-content"
                  >
                    <LoaderCircle
                      className="auth-card-spinner"
                      aria-hidden="true"
                      size={17}
                    />
                    正在验证
                  </motion.span>
                ) : (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="auth-card-button-content"
                  >
                    登录
                    <ArrowRight aria-hidden="true" size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="auth-card-divider" aria-hidden="true">
              <span />
              <i>或</i>
              <span />
            </div>

            <button
              className="auth-card-secondary"
              type="button"
              onClick={() => setStatus("机构统一身份认证尚未接入")}
            >
              <Building2 aria-hidden="true" size={17} strokeWidth={1.7} />
              使用机构账号登录
            </button>

            <p className="auth-card-status" role="status" aria-live="polite">
              {status}
            </p>
          </form>
        </section>
      </motion.div>
    </motion.div>
  );
}
