import React, { useState, useRef, useEffect, useCallback } from 'react';
import { register as registerAPI } from '../services/apiClient';
import AuthInput from './AuthInput';
import PasswordField from './PasswordField';
import AuthSubmitButton from './AuthSubmitButton';
import ErrorMessage from '../common/ErrorMessage';

/**
 * RegisterForm
 * Yeni register() dönüşü:
 * {
 *   ok: boolean,
 *   status: number,
 *   token?: string|null,
 *   user?: { id?, username } | null,
 *   error: string|null
 * }
 */
export default function RegisterForm({ onSuccess, onError }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    if (globalError) setGlobalError('');
  }, [username, password, globalError]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    const u = username.trim();

    if (!u) errs.username = 'Kullanıcı adı gerekli.';
    else if (/\s/.test(u)) errs.username = 'Boşluk içeremez.';
    else if (!/^[A-Za-z0-9_]{3,32}$/.test(u)) errs.username = '3-32 (harf, rakam, altçizgi)';
    if (password.length < 8) errs.password = 'En az 8 karakter.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [username, password]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await registerAPI(username.trim(), password, {
        signal: abortRef.current.signal,
      });

      if (res.ok) {
        // Başarılı kayıt (token dönmedi ise sadece success kabul)
        setUsername('');
        setPassword('');
        onSuccess?.(res);
      } else {
        setGlobalError(res.error || 'Kayıt başarısız.');
        onError?.(res);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setGlobalError('Sunucuya erişilemiyor.');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-[#23263a] via-[#28304a] to-[#181c2a] shadow-2xl border border-[#28304a] rounded-2xl max-w-md w-full mx-auto px-8 py-10 flex flex-col gap-5"
      aria-label="Kayıt Formu"
      noValidate
    >
      <h2 className="text-2xl font-bold text-[#5ea4ff] text-center drop-shadow-lg tracking-wide mb-2">
        Kayıt Ol
      </h2>

      <AuthInput
        id="register-username"
        label="Kullanıcı Adı"
        autoComplete="username"
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={fieldErrors.username}
        maxLength={32}
      />

      <PasswordField
        id="register-password"
        label="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        error={fieldErrors.password}
        minLength={8}
      />

      {globalError && (
        <ErrorMessage
          message={globalError}
          variant="error"
          dismissible
          onClose={() => setGlobalError('')}
        />
      )}

      <AuthSubmitButton loading={loading} loadingText="Kaydediliyor...">
        Kayıt Ol
      </AuthSubmitButton>
    </form>
  );
}
