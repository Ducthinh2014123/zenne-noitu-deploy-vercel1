import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  IconLock,
  IconMail,
  IconKey,
  IconShieldCheck,
  IconCheckCircle,
  IconAlertTriangle,
  IconInfo,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconCheck,
  IconRocket,
  IconChevronRight,
  IconLogIn,
} from '../../components/icons';

/*
 * ============================================================
 * RESET PASSWORD PAGE
 * ============================================================
 *
 * QUAN TRỌNG:
 *
 * Page này chạy ở BROWSER.
 *
 * KHÔNG import recoveryApi từ ../../lib/recoveryApi ở đây,
 * vì recoveryApi sử dụng:
 *
 *   process.env.BOT_API_URL
 *
 * Đây là biến server-side và browser sẽ không nhận được nó.
 *
 * Kiến trúc:
 *
 * Browser
 *   ↓
 * /api/auth/recovery/...
 *   ↓
 * Next.js API Route
 *   ↓
 * recoveryApi()
 *   ↓
 * Python BOT_API
 *
 * EMAIL_API_KEY tuyệt đối không nằm trong file này.
 */


/* ============================================================
 * CONSOLE RECOVERY SCRIPT
 * ============================================================
 *
 * Script này chỉ gửi Recovery Token tới Next.js API route.
 * Server mới là bên xác minh token và tạo reset_session cookie.
 */
const RECOVERY_SCRIPT = `const token = prompt("Nhập Recovery Token:");

if (!token) {
  alert("Bạn chưa nhập Recovery Token.");
} else {
  fetch("/api/auth/recovery/token/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token })
  })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
          "Recovery Token không hợp lệ hoặc đã hết hạn."
        );
      }

      window.location.reload();
    })
    .catch((error) => {
      alert(error.message);
    });
}`;


/* ============================================================
 * ALERT
 * ============================================================ */

function Alert({ type = 'info', children }) {
  const map = {
    info: {
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
      Icon: IconInfo,
    },

    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      Icon: IconCheckCircle,
    },

    error: {
      bg: 'bg-red-500/10 border-red-500/30 text-red-300',
      Icon: IconAlertTriangle,
    },
  };

  const { bg, Icon } = map[type] || map.info;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${bg}`}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}


/* ============================================================
 * BACK BUTTON
 * ============================================================ */

function BackBtn({ onClick, children = 'Quay lại' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-gray-500 hover:text-gray-300 font-medium mb-4 inline-flex items-center gap-1"
    >
      ← {children}
    </button>
  );
}


/* ============================================================
 * PAGE
 * ============================================================ */

export default function ResetPasswordPage() {
  const router = useRouter();

  /*
   * choose
   * email_request
   * email_verify
   * token_ready
   * admin_contact
   * new_password
   * totp_verify
   * done
   */
  const [step, setStep] = useState('choose');

  const [checkingSession, setCheckingSession] = useState(true);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [directToken, setDirectToken] = useState('');

  const [copied, setCopied] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  /* ==========================================================
   * CHECK RESET SESSION
   * ==========================================================
   *
   * Browser → Next.js API route
   *
   * Không gọi BOT_API trực tiếp.
   */
  const checkSession = useCallback(async () => {
    setCheckingSession(true);

    try {
      const response = await fetch(
        '/api/auth/recovery/status',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data && data.canResetPassword) {
        if (data.totpEnabled) {
          setTotpRequired(true);
        }
        setStep('new_password');
      }
    } catch (_) {
      /*
       * Bỏ qua lỗi mạng.
       *
       * Người dùng vẫn có thể thử lại thủ công.
       */
    } finally {
      setCheckingSession(false);
    }
  }, []);


  /* ==========================================================
   * INITIAL SESSION CHECK
   * ========================================================== */

  useEffect(() => {
    checkSession();
  }, [checkSession]);


  /* ==========================================================
   * RESET ALL
   * ========================================================== */

  const resetAll = () => {
    setMsg(null);

    setEmail('');
    setCode('');
    setRecoveryToken('');
    setDirectToken('');

    setCopied(false);
    setCopiedAdmin(false);

    setPw('');
    setPw2('');
    setTotpCode('');
    setTotpRequired(false);

    setStep('choose');
  };


  /* ==========================================================
   * STEP 1
   * REQUEST EMAIL RECOVERY CODE
   * ==========================================================
   *
   * Browser
   *   ↓
   * /api/auth/recovery/request
   *   ↓
   * Next.js API Route
   *   ↓
   * Python BOT_API
   *   ↓
   * Resend
   */

  const submitEmailRequest = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const response = await fetch(
        '/api/auth/recovery/request',
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },

          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      /*
       * Response generic:
       *
       * Không tiết lộ email có tồn tại hay không.
       */
      setMsg({
        type: 'success',

        text:
          (data && data.message) ||
          'Nếu tài khoản tồn tại, mã xác minh đã được gửi.',
      });

      setStep('email_verify');
    } catch (_) {
      setMsg({
        type: 'error',
        text: 'Không thể kết nối đến server. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };


  /* ==========================================================
   * STEP 2
   * VERIFY EMAIL RECOVERY CODE
   * ========================================================== */

  const submitEmailVerify = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim();
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const response = await fetch(
        '/api/auth/recovery/email/verify',
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },

          body: JSON.stringify({
            email: normalizedEmail,
            code: normalizedCode,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      if (
        !response.ok ||
        !data ||
        !data.success
      ) {
        setMsg({
          type: 'error',

          text:
            (data && data.error) ||
            'Mã xác minh không hợp lệ hoặc đã hết hạn.',
        });

        return;
      }

      /*
       * Recovery Token được server trả về.
       *
       * Token này chưa phải login session.
       */
      setRecoveryToken(
        data.recovery_token || ''
      );

      setStep('token_ready');
    } catch (_) {
      setMsg({
        type: 'error',
        text: 'Không thể kết nối đến server. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };


  /* ==========================================================
   * COPY RECOVERY SCRIPT
   * ========================================================== */

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(
        RECOVERY_SCRIPT
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (_) {
      /*
       * Clipboard có thể bị browser chặn.
       *
       * Người dùng vẫn có thể copy thủ công.
       */
    }
  };


  /* ==========================================================
   * COPY RECOVERY TOKEN
   * ========================================================== */

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(
        recoveryToken
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (_) {
      /*
       * noop
       */
    }
  };


  /* ==========================================================
   * VERIFY DIRECT ADMIN TOKEN (FOR MOBILE & WEB)
   * ========================================================== */

  const submitDirectToken = async (e) => {
    if (e) e.preventDefault();
    setMsg(null);
    const tok = directToken.trim();
    if (!tok) {
      setMsg({
        type: 'error',
        text: 'Vui lòng dán Admin Recovery Token của bạn.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/recovery/token/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ token: tok }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      if (!response.ok || !data || !data.success) {
        setMsg({
          type: 'error',
          text: data?.error || 'Recovery Token không hợp lệ hoặc đã hết hạn.',
        });
        return;
      }

      await checkSession();
      setStep('new_password');
    } catch (_) {
      setMsg({
        type: 'error',
        text: 'Không thể kết nối đến server. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };


  /* ==========================================================
   * FINAL STEP
   * RESET PASSWORD
   * ==========================================================
   *
   * Browser
   *   ↓
   * /api/auth/recovery/reset-password
   *   ↓
   * Next.js
   *   ↓
   * Python BOT_API
   *
   * Server lấy user từ reset_session cookie.
   *
   * Client KHÔNG gửi user_id.
   */

  const submitNewPassword = async (e) => {
    e.preventDefault();

    setMsg(null);

    if (pw.length < 6) {
      setMsg({
        type: 'error',
        text: 'Mật khẩu mới tối thiểu 6 ký tự.',
      });

      return;
    }

    if (pw !== pw2) {
      setMsg({
        type: 'error',
        text: 'Mật khẩu nhập lại không khớp.',
      });

      return;
    }

    // Nếu tài khoản yêu cầu xác thực 2 bước (One-Time Code)
    if (totpRequired) {
      setStep('totp_verify');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        '/api/auth/recovery/reset-password',
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },

          body: JSON.stringify({
            password: pw,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      if (data?.needs2FA) {
        setTotpRequired(true);
        setStep('totp_verify');
        return;
      }

      if (
        !response.ok ||
        !data ||
        !data.success
      ) {
        setMsg({
          type: 'error',

          text:
            (data && data.error) ||
            'Không thể đặt lại mật khẩu. Vui lòng thử lại từ đầu.',
        });

        return;
      }

      setStep('done');
    } catch (_) {
      setMsg({
        type: 'error',
        text: 'Không thể kết nối đến server. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };


  /* ==========================================================
   * SUBMIT 2-STEP / ONE-TIME CODE (TOTP)
   * ========================================================== */

  const submitTotpReset = async (e) => {
    e.preventDefault();
    setMsg(null);

    const codeClean = totpCode.trim();
    if (codeClean.length !== 6) {
      setMsg({
        type: 'error',
        text: 'Vui lòng nhập đúng 6 chữ số One-Time Code.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/recovery/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          password: pw,
          totp_code: codeClean,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      if (!response.ok || !data || !data.success) {
        setMsg({
          type: 'error',
          text: data?.message || data?.error || 'Mã One-Time Code không đúng hoặc đã hết hạn.',
        });
        return;
      }

      setStep('done');
    } catch (_) {
      setMsg({
        type: 'error',
        text: 'Không thể kết nối đến server. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };


  /* ==========================================================
   * RENDER
   * ========================================================== */

  return (
    <>
      <Head>
        <title>Khôi phục tài khoản</title>
      </Head>

      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <IconLock className="w-5 h-5 text-indigo-400" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white">
                  Khôi phục tài khoản
                </h1>

                {step === 'choose' && (
                  <p className="text-xs text-gray-500">
                    Chọn phương thức xác minh
                  </p>
                )}
              </div>

            </div>


            {/* =================================================
                SESSION CHECKING
            ================================================== */}

            {checkingSession &&
              step === 'choose' && (
                <div className="mb-4">
                  <Alert type="info">
                    Đang kiểm tra phiên khôi phục...
                  </Alert>
                </div>
              )}


            {/* =================================================
                GLOBAL MESSAGE
            ================================================== */}

            {msg && step !== 'choose' && (
              <div className="mb-4">
                <Alert type={msg.type}>
                  {msg.text}
                </Alert>
              </div>
            )}


            {/* =================================================
                CHOOSE METHOD
            ================================================== */}

            {step === 'choose' && (
              <div className="space-y-3">

                <button
                  type="button"
                  onClick={() => {
                    setMsg(null);
                    setStep('email_request');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 text-gray-200 hover:text-white rounded-xl transition-all font-medium text-sm group"
                >
                  <IconMail className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">📧 Xác minh bằng Email</div>
                    <div className="text-xs text-gray-400 font-normal">Gửi mã khôi phục tới hòm thư email của bạn</div>
                  </div>
                  <IconChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMsg(null);
                    setStep('token_ready');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-amber-500/60 text-gray-200 hover:text-white rounded-xl transition-all font-medium text-sm group"
                >
                  <IconKey className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">🔑 Nhập Admin Recovery Token</div>
                    <div className="text-xs text-gray-400 font-normal">Dán mã token khôi phục trực tiếp trên web (tiện cho cả đt & PC)</div>
                  </div>
                  <IconChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMsg(null);
                    setStep('admin_contact');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-[#5865F2] text-gray-200 hover:text-white rounded-xl transition-all font-medium text-sm group"
                >
                  <IconShieldCheck className="w-5 h-5 text-[#5865F2] flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">💬 Nhờ Admin khôi phục tài khoản hộ</div>
                    <div className="text-xs text-indigo-300 font-normal">Dành cho điện thoại / Kết bạn Discord: toilathangvnxd</div>
                  </div>
                  <IconChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>

                <p className="text-center text-sm text-gray-500 pt-2">
                  <Link
                    href="/auth/login"
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    ← Quay lại đăng nhập
                  </Link>
                </p>

              </div>
            )}


            {/* =================================================
                ADMIN CONTACT (DÀNH CHO ĐIỆN THOẠI)
            ================================================== */}

            {step === 'admin_contact' && (
              <div>
                <BackBtn onClick={resetAll} />

                <div className="bg-[#111827] border border-indigo-900/40 rounded-2xl p-5 mb-4 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.031.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base">Hỗ trợ khôi phục qua Discord</h3>
                      <p className="text-xs text-gray-400">Dành cho người dùng điện thoại / Không rành kỹ thuật</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    Nếu bạn đang dùng điện thoại hoặc không mở được Console, bạn không cần phải thao tác phức tạp! Hãy kết bạn trực tiếp với Admin trên Discord:
                  </p>

                  <div className="bg-gray-900 border border-gray-700/80 rounded-xl p-3.5 flex items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Discord Admin Username</div>
                      <div className="text-base font-mono font-bold text-indigo-300 mt-0.5">toilathangvnxd</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText('toilathangvnxd');
                          setCopiedAdmin(true);
                          setTimeout(() => setCopiedAdmin(false), 2500);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      {copiedAdmin ? (
                        <><IconCheck className="w-4 h-4 text-emerald-300" /> Đã chép!</>
                      ) : (
                        <><IconCopy className="w-4 h-4" /> Sao chép</>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-gray-400 bg-gray-900/60 rounded-xl p-3 border border-gray-800/80">
                    <div className="flex items-start gap-2">
                      <span className="text-[#5865F2] font-bold">1.</span>
                      <span>Mở app Discord, gửi lời mời kết bạn tới <b className="text-white">toilathangvnxd</b>.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#5865F2] font-bold">2.</span>
                      <span>Nhắn cho Admin địa chỉ email của tài khoản cần hỗ trợ.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#5865F2] font-bold">3.</span>
                      <span>Admin sẽ xác minh và cấp mã <b>Admin Recovery Token</b> hoặc trực tiếp hỗ trợ đặt lại mật khẩu cho bạn.</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('token_ready')}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <IconKey className="w-4 h-4 text-amber-400" />
                  Tôi đã có mã từ Admin, nhập token ngay
                </button>
              </div>
            )}


            {/* =================================================
                TOKEN READY (NHẬP TOKEN TRỰC TIẾP TRÊN WEB)
            ================================================== */}

            {step === 'token_ready' && (
              <div>
                <BackBtn onClick={resetAll} />

                {recoveryToken && (
                  <div className="mb-4">
                    <Alert type="success">
                      Xác minh thành công! Recovery Token của bạn:
                    </Alert>
                    <div className="relative mt-2">
                      <textarea
                        readOnly
                        rows={2}
                        value={recoveryToken}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-emerald-300 text-xs font-mono resize-none"
                      />
                      <button
                        type="button"
                        onClick={copyToken}
                        title="Sao chép"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                      >
                        {copied ? <IconCheck className="w-4 h-4 text-emerald-400" /> : <IconCopy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <IconKey className="w-5 h-5 text-amber-400" />
                    <h3 className="text-white font-semibold text-sm">Nhập Admin Recovery Token</h3>
                  </div>

                  <p className="text-xs text-gray-400 mb-3">
                    Dán Recovery Token do Admin cung cấp vào ô bên dưới (tiện lợi cho cả điện thoại & máy tính):
                  </p>

                  <form onSubmit={submitDirectToken} className="space-y-3">
                    <textarea
                      required
                      rows={3}
                      value={directToken}
                      onChange={(e) => setDirectToken(e.target.value)}
                      placeholder="Dán token tại đây (ví dụ: rec_...)"
                      className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-emerald-300 text-xs font-mono resize-none focus:outline-none placeholder-gray-600"
                    />

                    <button
                      type="submit"
                      disabled={loading || !directToken.trim()}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-md active:scale-98"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <IconCheckCircle className="w-4 h-4" />
                      )}
                      Xác minh Token & Tiếp tục
                    </button>
                  </form>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3.5 mb-4 flex items-center justify-between gap-3 text-xs">
                  <div className="text-gray-400">
                    Chưa có mã Token? Kết bạn Discord: <b className="text-indigo-300">toilathangvnxd</b>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText('toilathangvnxd');
                        setCopiedAdmin(true);
                        setTimeout(() => setCopiedAdmin(false), 2500);
                      }
                    }}
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg flex items-center gap-1 flex-shrink-0"
                  >
                    {copiedAdmin ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
                    Sao chép
                  </button>
                </div>

                {/* Collapsible script console cho ai thích dùng F12 trên PC */}
                <details className="text-xs text-gray-500 group">
                  <summary className="cursor-pointer hover:text-gray-300 select-none py-1">
                    🛠️ Hoặc dùng Developer Console (dành cho PC nếu muốn)
                  </summary>
                  <div className="mt-2 relative">
                    <pre className="w-full overflow-x-auto bg-black/60 border border-gray-800 rounded-xl px-4 py-3 text-[11px] leading-5 text-gray-300 font-mono">
                      <code>{RECOVERY_SCRIPT}</code>
                    </pre>
                    <button
                      type="button"
                      onClick={copyScript}
                      className="absolute right-2 top-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-2 py-1 flex items-center gap-1"
                    >
                      {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
                      Sao chép
                    </button>
                  </div>
                </details>

              </div>
            )}


            {/* =================================================
                NEW PASSWORD
            ================================================== */}

            {step === 'new_password' && (
              <form onSubmit={submitNewPassword}>

                <div className="mb-4">
                  <Alert type="success">
                    Xác minh thành công. Hãy đặt mật khẩu mới cho tài khoản.
                  </Alert>
                </div>


                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Mật khẩu mới
                </label>

                <div className="relative mb-3">

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IconKey className="w-4 h-4" />
                  </div>

                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={pw}
                    onChange={(e) =>
                      setPw(e.target.value)
                    }
                    className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none text-sm"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((s) => !s)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPw ? (
                      <IconEyeOff className="w-4 h-4" />
                    ) : (
                      <IconEye className="w-4 h-4" />
                    )}
                  </button>

                </div>


                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Nhập lại mật khẩu
                </label>

                <div className="relative mb-4">

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IconKey className="w-4 h-4" />
                  </div>

                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={pw2}
                    onChange={(e) =>
                      setPw2(e.target.value)
                    }
                    className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none text-sm"
                    placeholder="••••••••"
                  />

                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >

                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <IconLock className="w-4 h-4" />
                  )}

                  Đặt lại mật khẩu

                </button>

              </form>
            )}


            {/* =================================================
                TOTP VERIFY (MÃ ONE-TIME CODE 6 SỐ)
            ================================================== */}

            {step === 'totp_verify' && (
              <form onSubmit={submitTotpReset}>
                <BackBtn onClick={() => setStep('new_password')} />

                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <IconShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Xác thực 2 bước</h3>
                  <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
                    Tài khoản của bạn đã kích hoạt bảo vệ 2 lớp. Vui lòng mở ứng dụng <b className="text-gray-200">Google Authenticator</b> hoặc <b className="text-gray-200">Authy</b> và nhập mã 6 chữ số:
                  </p>
                </div>

                <div className="mb-5">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl py-3 text-center text-white text-2xl tracking-[0.5em] font-mono focus:outline-none shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 text-sm active:scale-98 transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <IconCheckCircle className="w-4 h-4" />
                  )}
                  Xác nhận & Hoàn tất đổi mật khẩu
                </button>
              </form>
            )}


            {/* =================================================
                DONE
            ================================================== */}

            {step === 'done' && (
              <div>

                <div className="mb-4">
                  <Alert type="success">
                    Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng email và mật khẩu mới.
                  </Alert>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push('/auth/login')
                  }
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <IconLogIn className="w-4 h-4" />
                  Đăng nhập ngay
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
