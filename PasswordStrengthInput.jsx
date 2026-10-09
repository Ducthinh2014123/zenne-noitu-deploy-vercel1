import { useState, useMemo } from 'react';

// ── Icons for Tiers (Paperclip -> Padlock -> Safe -> Vault)
const PaperclipIcon = ({ className = "w-12 h-12 text-gray-300" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 16v18a5 5 0 0 0 10 0V13a8 8 0 0 0-16 0v22a12 12 0 0 0 24 0V15" />
  </svg>
);

const PadlockIcon = ({ className = "w-12 h-12 text-gray-300" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="11" y="20" width="26" height="21" rx="5" />
    <path d="M17 20v-6a7 7 0 0 1 14 0v6" />
    <circle cx="24" cy="29" r="2.5" fill="currentColor" />
    <path d="M24 31.5v4" />
  </svg>
);

const SafeIcon = ({ className = "w-12 h-12 text-gray-300" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="8" y="9" width="32" height="30" rx="5" />
    <circle cx="23" cy="24" r="8" />
    <circle cx="23" cy="24" r="2.5" fill="currentColor" />
    <path d="M23 16v2.5M23 29.5v2.5M15 24h2.5M28.5 24h2.5" />
    <circle cx="34" cy="24" r="1.5" fill="currentColor" />
  </svg>
);

const VaultIcon = ({ className = "w-12 h-12 text-gray-300" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="6" y="6" width="36" height="36" rx="6" />
    <circle cx="24" cy="24" r="12" />
    <circle cx="24" cy="24" r="4.5" fill="currentColor" />
    <path d="M24 7v5M24 36v5M7 24h5M36 24h5" />
    <path d="M12 12l3.5 3.5M32.5 32.5L36 36M12 36l3.5-3.5M32.5 15.5L36 12" />
  </svg>
);

// ── Eye Icons in purple theme
const EyePurple = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-400 hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffPurple = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-400 hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

// ── Calculate mathematical entropy: L * log2(pool)
export function calculateEntropy(pw) {
  if (!pw) return 0;
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  if (pool === 0) return 0;
  return Math.floor(pw.length * Math.log2(pool));
}

// ── Determine Tier (Paperclip -> Vault)
export function getPasswordTier(entropy, pwLength) {
  if (!pwLength || entropy < 28) {
    return {
      id: 'paperclip',
      title: 'A bent paperclip',
      subtitle: pwLength ? 'Cracked instantly.' : 'Enter a password.',
      color: '#f87171',
      Icon: PaperclipIcon,
    };
  }
  if (entropy < 50) {
    return {
      id: 'padlock',
      title: 'A cheap padlock',
      subtitle: 'Cracked in a few minutes.',
      color: '#fb923c',
      Icon: PadlockIcon,
    };
  }
  if (entropy < 75) {
    return {
      id: 'safe',
      title: 'A combination safe',
      subtitle: 'Cracked in several years.',
      color: '#38bdf8',
      Icon: SafeIcon,
    };
  }
  return {
    id: 'vault',
    title: 'A bank vault',
    subtitle: 'Takes millennia to crack.',
    color: '#4ade80',
    Icon: VaultIcon,
  };
}

// ── Cryptographically secure strong password generator
export function generateStrongPassword() {
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()_+~-=";
  const all = lowercase + uppercase + numbers + symbols;

  let pass = "";
  const getRand = (max) => {
    if (typeof window !== "undefined" && window.crypto) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  // Ensure diverse character classes
  pass += lowercase[getRand(lowercase.length)];
  pass += uppercase[getRand(uppercase.length)];
  pass += numbers[getRand(numbers.length)];
  pass += symbols[getRand(symbols.length)];
  pass += lowercase[getRand(lowercase.length)];
  pass += uppercase[getRand(uppercase.length)];
  pass += numbers[getRand(numbers.length)];
  pass += symbols[getRand(symbols.length)];

  while (pass.length < 16) {
    pass += all[getRand(all.length)];
  }

  return pass.split('').sort(() => 0.5 - Math.random()).join('');
}

export default function PasswordStrengthInput({
  value = '',
  onChange,
  onSuggest,
  error = '',
  label = 'Password',
  placeholder = 'Nhập mật khẩu...',
  autoComplete = 'new-password',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const entropy = useMemo(() => calculateEntropy(value), [value]);
  const tier = useMemo(() => getPasswordTier(entropy, value.length), [entropy, value.length]);
  const TierIcon = tier.Icon;

  const handleSuggest = () => {
    const generated = generateStrongPassword();
    if (onChange) {
      onChange({ target: { value: generated } });
    }
    if (onSuggest) {
      onSuggest(generated);
    }
    setShowPassword(true);

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generated).catch(() => {});
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={handleSuggest}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 focus:outline-none"
        >
          {copiedNotice ? (
            <span className="text-emerald-400 font-medium">✓ Đã sao chép!</span>
          ) : (
            <span>Suggest strong</span>
          )}
        </button>
      </div>

      {/* Input Field with purple focus-within glow */}
      <div className={`password-field relative flex items-center bg-[#0d0f17] border rounded-2xl px-4 py-2.5 transition-all ${
        error ? 'border-red-600' : 'border-gray-800'
      }`}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="bg-transparent flex-1 text-white text-sm placeholder-gray-500 focus:outline-none pr-3"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 focus:outline-none flex-shrink-0"
          title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {showPassword ? <EyeOffPurple /> : <EyePurple />}
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      {/* Strength Card (Paperclip -> Vault) */}
      <div
        className="strength-card mt-3 p-4 rounded-2xl flex items-center gap-4 bg-[#0e111a]/95 backdrop-blur-md shadow-lg"
        style={{
          '--tier': tier.color,
          borderColor: `color-mix(in srgb, ${tier.color} 18%, transparent)`,
        }}
      >
        {/* Left Badge with Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#141824] rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner">
          <TierIcon className="w-12 h-12 text-gray-300" />
        </div>

        {/* Right Info */}
        <div className="flex-1 min-w-0">
          <div
            className="strength-title font-bold text-lg sm:text-xl tracking-tight leading-snug"
            style={{ color: tier.color }}
          >
            {tier.title}
          </div>
          <div className="text-gray-200 font-medium text-sm mt-0.5">
            {tier.subtitle}
          </div>
          <div className="text-gray-400 text-xs mt-1.5 font-medium">
            <span className="text-gray-100 font-semibold">{entropy}</span> bits of entropy
          </div>
        </div>
      </div>
    </div>
  );
}

