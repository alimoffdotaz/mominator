export function createAuthUI({ authSignUp, authSignIn, recoverPassword, saveSession, onSignedIn }) {
  let authMode = 'signin';

  function switchAuthTab(mode) {
    authMode = mode;
    document.getElementById('tab-signin').classList.toggle('active', mode === 'signin');
    document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
    document.getElementById('auth-submit-btn').textContent = mode === 'signin' ? 'Войти' : 'Создать аккаунт';
    document.getElementById('auth-forgot').style.display = mode === 'signin' ? '' : 'none';
    document.getElementById('auth-error').classList.remove('show');
    document.getElementById('auth-success').classList.remove('show');
    document.getElementById('auth-password').autocomplete = mode === 'signin' ? 'current-password' : 'new-password';
  }

  function setAuthError(msg) {
    const el = document.getElementById('auth-error');
    el.textContent = msg;
    el.classList.add('show');
    document.getElementById('auth-success').classList.remove('show');
  }

  function setAuthSuccess(msg) {
    const el = document.getElementById('auth-success');
    el.textContent = msg;
    el.classList.add('show');
    document.getElementById('auth-error').classList.remove('show');
  }

  function clearAuthMessages() {
    document.getElementById('auth-error').classList.remove('show');
    document.getElementById('auth-success').classList.remove('show');
  }

  async function authSubmit() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const btn = document.getElementById('auth-submit-btn');

    if (!email) {
      setAuthError('Введите email');
      return;
    }
    if (!password || password.length < 6) {
      setAuthError('Пароль — минимум 6 символов');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Подождите…';
    clearAuthMessages();

    try {
      let data;
      if (authMode === 'signup') {
        data = await authSignUp(email, password);
        if (data.error || data.msg) {
          setAuthError(data.error || data.msg);
          btn.disabled = false;
          btn.textContent = 'Создать аккаунт';
          return;
        }
        setAuthSuccess('✓ Аккаунт создан! Проверьте email для подтверждения, затем войдите.');
        switchAuthTab('signin');
        btn.disabled = false;
        return;
      }

      data = await authSignIn(email, password);
      if (data.error || data.error_description) {
        setAuthError(data.error_description || data.error);
        btn.disabled = false;
        btn.textContent = 'Войти';
        return;
      }

      saveSession(data);
      await onSignedIn();
    } catch {
      setAuthError('Ошибка соединения. Проверьте интернет.');
      btn.disabled = false;
      btn.textContent = authMode === 'signin' ? 'Войти' : 'Создать аккаунт';
    }
  }

  async function authForgotPassword() {
    const email = document.getElementById('auth-email').value.trim();
    if (!email) {
      setAuthError('Введите email выше');
      return;
    }
    try {
      await recoverPassword(email);
      setAuthSuccess(`✓ Письмо для сброса пароля отправлено на ${email}`);
    } catch {
      setAuthError('Ошибка. Попробуйте позже.');
    }
  }

  return { switchAuthTab, authSubmit, authForgotPassword };
}
