import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../services/apiClient';
import AuthInput from './AuthInput';
import PasswordField from './PasswordField';
import AuthSubmitButton from './AuthSubmitButton';
import ErrorMessage from '../common/ErrorMessage';

export default function LoginForm({ onSuccess, onError }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  // Alan değişince global error temizle
  useEffect(() => {
    if (globalError) setGlobalError('');
  }, [username, password, globalError]);

  // Unmount iptal
  useEffect(() => () => abortRef.current?.abort(), []);

  const validate = useCallback(() => {
    const errs = {};
    if (!username.trim()) errs.username = 'Kullanıcı adı gerekli.';
    if (!password) errs.password = 'Şifre gerekli.';
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
      const res = await loginAPI(username.trim(), password, {
        signal: abortRef.current.signal,
      });
      if (res.ok) {
        login({
          username: res.user?.username || username.trim(),
          id: res.user?.id,
          token: res.token,
          loggedAt: Date.now(),
        });
        setUsername('');
        setPassword('');
        onSuccess?.(res);
      } else {
        setGlobalError(res.error || 'Giriş başarısız.');
        onError?.(res);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setGlobalError('Sunucuya ulaşılamıyor.');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 bg-[#23263ae6] rounded-2xl p-8 shadow-xl relative z-20 w-full max-w-md"
      aria-label="Giriş Formu"
      noValidate
    >
      <h2 className="text-3xl font-extrabold text-[#5ea4ff] text-center tracking-wider mb-2">
        Giriş Yap
      </h2>

      <AuthInput
        id="login-username"
        label="Kullanıcı Adı"
        autoComplete="username"
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={fieldErrors.username}
        maxLength={32}
      />

      <PasswordField
        id="login-password"
        label="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        error={fieldErrors.password}
      />

      {globalError && (
        <ErrorMessage
          message={globalError}
          variant="error"
          dismissible
          onClose={() => setGlobalError('')}
        />
      )}

      <AuthSubmitButton loading={loading} loadingText="Giriş yapılıyor...">
        Giriş Yap
      </AuthSubmitButton>
    </form>
  );
}
