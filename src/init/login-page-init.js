/**
 * 登入頁面初始化 - 處理登入流程
 * @module init/login-page-init
 *
 * 此模組負責登入頁面的所有初始化與互動邏輯，包括：
 * - 登入表單處理
 * - 註冊表單處理
 * - 自動登入檢查
 * - 登入後重定向
 * - 表單驗證
 *
 * 依賴於 Phase 1-2 的模組（待實現時取消註解）
 */

// ============ Phase 1-2 依賴（待模組創建後啟用） ============
// import { LOGIN_MANAGER } from '../core/login-manager.js';
// import { $, $q } from '../utils/dom-utils.js';
// import { toast } from '../utils/helpers.js';
// import { FormManager } from '../ui/form-manager.js';

/**
 * 登入頁面初始化管理器
 * @namespace LoginPageInit
 */
export const LoginPageInit = {
  /**
   * 初始化登入頁面
   * @returns {boolean} 初始化是否成功
   *
   * @example
   * // 在 login.html 頁面自動初始化
   * LoginPageInit.init();
   */
  init() {
    console.log('🔐 初始化登入頁面...');

    // 檢查必要元素
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (!loginForm || !signupForm) {
      console.warn('⚠️ 登入頁面元素不完整，跳過初始化');
      return false;
    }

    try {
      // 設置登入表單
      this.setupLoginForm();

      // 設置註冊表單
      this.setupSignupForm();

      // 設置切換按鈕
      this.setupSwitchButtons();

      // 檢查自動登入
      this.checkAutoLogin();

      console.log('✅ 登入頁面初始化完成');
      return true;
    } catch (error) {
      console.error('❌ 登入頁面初始化失敗:', error);
      this.showLoginError('頁面初始化失敗，請重新載入');
      return false;
    }
  },

  /**
   * 設置登入表單
   */
  setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      this.handleLogin(e);
    });

    // 設置登入按鈕
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin) {
      btnLogin.addEventListener('click', e => {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit'));
      });
    }

    console.log('✅ 登入表單已設置');
  },

  /**
   * 設置註冊表單
   */
  setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      this.handleSignup(e);
    });

    // 設置註冊按鈕
    const btnSignup = document.getElementById('btnSignup');
    if (btnSignup) {
      btnSignup.addEventListener('click', e => {
        e.preventDefault();
        signupForm.dispatchEvent(new Event('submit'));
      });
    }

    console.log('✅ 註冊表單已設置');
  },

  /**
   * 設置切換按鈕
   */
  setupSwitchButtons() {
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');

    // 切換到註冊
    const switchToSignup = document.getElementById('switchToSignup');
    const toSignupSection = document.getElementById('toSignupSection');

    [switchToSignup, toSignupSection].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', e => {
          e.preventDefault();
          if (loginSection) loginSection.hidden = true;
          if (signupSection) signupSection.hidden = false;
          this.clearMessages();
        });
      }
    });

    // 切換到登入
    const switchToLogin = document.getElementById('switchToLogin');
    const toLoginSection = document.getElementById('toLoginSection');

    [switchToLogin, toLoginSection].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', e => {
          e.preventDefault();
          if (signupSection) signupSection.hidden = true;
          if (loginSection) loginSection.hidden = false;
          this.clearMessages();
        });
      }
    });

    console.log('✅ 切換按鈕已設置');
  },

  /**
   * 處理登入
   * @param {Event} event - 表單提交事件
   */
  handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    // 驗證表單
    if (!this.validateLoginForm(username, password)) {
      return;
    }

    console.log('🔐 嘗試登入:', username);

    try {
      // TODO: 待 Phase 2 完成後啟用
      // const result = LOGIN_MANAGER.login(username, password, rememberMe);

      // 臨時實現：使用全域物件（如果存在）
      let result = null;
      if (typeof window !== 'undefined' && window.LOGIN_MANAGER) {
        result = window.LOGIN_MANAGER.login(username, password, rememberMe);
      }

      if (result && result.success) {
        console.log('✅ 登入成功');
        this.showLoginSuccess('登入成功，正在跳轉...');

        // 保存登入會話
        this.saveLoginSession(result.user);

        // 跳轉到主應用
        setTimeout(() => {
          this.redirectToApp();
        }, 500);
      } else {
        const errorMsg = result?.message || '登入失敗，請檢查用戶名和密碼';
        this.showLoginError(errorMsg);
      }
    } catch (error) {
      console.error('❌ 登入錯誤:', error);
      this.showLoginError('登入過程發生錯誤，請稍後再試');
    }
  },

  /**
   * 處理註冊
   * @param {Event} event - 表單提交事件
   */
  handleSignup(event) {
    event.preventDefault();

    const username = document.getElementById('signupUsername')?.value.trim();
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const email = document.getElementById('email')?.value.trim();

    // 驗證表單
    if (!this.validateSignupForm(username, password, confirmPassword, email)) {
      return;
    }

    console.log('📝 嘗試註冊:', username);

    try {
      // TODO: 待 Phase 2 完成後啟用
      // const result = LOGIN_MANAGER.signup(username, password, email);

      // 臨時實現：使用全域物件（如果存在）
      let result = null;
      if (typeof window !== 'undefined' && window.LOGIN_MANAGER) {
        result = window.LOGIN_MANAGER.signup(username, password, email);
      }

      if (result && result.success) {
        console.log('✅ 註冊成功');
        this.showSignupSuccess('註冊成功！請使用新帳號登入');

        // 清空註冊表單
        this.clearSignupForm();

        // 3 秒後切換到登入表單
        setTimeout(() => {
          const signupSection = document.getElementById('signupSection');
          const loginSection = document.getElementById('loginSection');
          if (signupSection) signupSection.hidden = true;
          if (loginSection) loginSection.hidden = false;
        }, 3000);
      } else {
        const errorMsg = result?.message || '註冊失敗，請稍後再試';
        this.showSignupError(errorMsg);
      }
    } catch (error) {
      console.error('❌ 註冊錯誤:', error);
      this.showSignupError('註冊過程發生錯誤，請稍後再試');
    }
  },

  /**
   * 處理登出
   */
  handleLogout() {
    console.log('🔓 執行登出...');

    try {
      // TODO: 待 Phase 2 完成後啟用
      // LOGIN_MANAGER.logout();

      // 臨時實現：使用全域物件（如果存在）
      if (typeof window !== 'undefined' && window.LOGIN_MANAGER) {
        window.LOGIN_MANAGER.logout();
      }

      console.log('✅ 登出成功');
      this.redirectToLogin();
    } catch (error) {
      console.error('❌ 登出錯誤:', error);
    }
  },

  /**
   * 檢查自動登入
   * @returns {boolean} 是否成功自動登入
   */
  checkAutoLogin() {
    console.log('🔍 檢查自動登入...');

    try {
      // TODO: 待 Phase 2 完成後啟用
      // const session = LOGIN_MANAGER.checkSession();

      // 臨時實現：使用全域物件（如果存在）
      let session = null;
      if (typeof window !== 'undefined' && window.LOGIN_MANAGER) {
        session = window.LOGIN_MANAGER.checkSession();
      }

      if (session && session.valid) {
        console.log('✅ 發現有效會話，自動登入');
        this.showLoginSuccess('自動登入成功，正在跳轉...');

        setTimeout(() => {
          this.redirectToApp();
        }, 500);

        return true;
      }
    } catch (error) {
      console.warn('⚠️ 自動登入檢查失敗:', error);
    }

    return false;
  },

  /**
   * 保存登入會話
   * @param {Object} user - 用戶物件
   */
  saveLoginSession(user) {
    if (!user) return;

    try {
      // 會話已由 LOGIN_MANAGER 保存，這裡可以做額外處理
      console.log('💾 保存登入會話:', user.username);

      // 記錄登入事件
      if (typeof window !== 'undefined' && window.loggerService) {
        window.loggerService.logSystemEvent('user_login', `用戶登入: ${user.username}`, 'info');
      }
    } catch (error) {
      console.error('❌ 保存登入會話失敗:', error);
    }
  },

  /**
   * 跳轉到主應用
   */
  redirectToApp() {
    console.log('🚀 跳轉到主應用...');
    window.location.href = 'index.html';
  },

  /**
   * 跳轉到登入頁面
   */
  redirectToLogin() {
    console.log('🔐 跳轉到登入頁面...');
    window.location.href = 'login.html';
  },

  // ============ UI 控制 ============

  /**
   * 顯示登入表單
   */
  showLoginForm() {
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');

    if (loginSection) loginSection.hidden = false;
    if (signupSection) signupSection.hidden = true;
  },

  /**
   * 顯示登入錯誤
   * @param {string} message - 錯誤訊息
   */
  showLoginError(message) {
    const errorMsg = document.getElementById('errorMsg');
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.classList.add('show');

      // 5 秒後自動隱藏
      setTimeout(() => {
        errorMsg.classList.remove('show');
      }, 5000);
    }
  },

  /**
   * 顯示登入成功訊息
   * @param {string} message - 成功訊息
   */
  showLoginSuccess(message) {
    const successMsg = document.getElementById('successMsg');
    if (successMsg) {
      successMsg.textContent = message;
      successMsg.classList.add('show');
    }
  },

  /**
   * 顯示註冊錯誤
   * @param {string} message - 錯誤訊息
   */
  showSignupError(message) {
    const signupErrorMsg = document.getElementById('signupErrorMsg');
    if (signupErrorMsg) {
      signupErrorMsg.textContent = message;
      signupErrorMsg.classList.add('show');

      // 5 秒後自動隱藏
      setTimeout(() => {
        signupErrorMsg.classList.remove('show');
      }, 5000);
    } else {
      // 如果沒有專用的註冊錯誤元素，使用登入錯誤元素
      this.showLoginError(message);
    }
  },

  /**
   * 顯示註冊成功訊息
   * @param {string} message - 成功訊息
   */
  showSignupSuccess(message) {
    const signupSuccessMsg = document.getElementById('signupSuccessMsg');
    if (signupSuccessMsg) {
      signupSuccessMsg.textContent = message;
      signupSuccessMsg.classList.add('show');
    } else {
      // 如果沒有專用的註冊成功元素，使用登入成功元素
      this.showLoginSuccess(message);
    }
  },

  /**
   * 清空登入表單
   */
  clearLoginForm() {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');

    if (username) username.value = '';
    if (password) password.value = '';
    if (rememberMe) rememberMe.checked = false;
  },

  /**
   * 清空註冊表單
   */
  clearSignupForm() {
    const username = document.getElementById('signupUsername');
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const email = document.getElementById('email');

    if (username) username.value = '';
    if (password) password.value = '';
    if (confirmPassword) confirmPassword.value = '';
    if (email) email.value = '';
  },

  /**
   * 清空所有訊息
   */
  clearMessages() {
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    const signupErrorMsg = document.getElementById('signupErrorMsg');
    const signupSuccessMsg = document.getElementById('signupSuccessMsg');

    if (errorMsg) errorMsg.classList.remove('show');
    if (successMsg) successMsg.classList.remove('show');
    if (signupErrorMsg) signupErrorMsg.classList.remove('show');
    if (signupSuccessMsg) signupSuccessMsg.classList.remove('show');
  },

  // ============ 驗證 ============

  /**
   * 驗證登入表單
   * @param {string} username - 用戶名
   * @param {string} password - 密碼
   * @returns {boolean} 驗證是否通過
   */
  validateLoginForm(username, password) {
    if (!username) {
      this.showLoginError('請輸入用戶名');
      return false;
    }

    if (!password) {
      this.showLoginError('請輸入密碼');
      return false;
    }

    if (username.length < 3) {
      this.showLoginError('用戶名至少需要 3 個字元');
      return false;
    }

    if (password.length < 4) {
      this.showLoginError('密碼至少需要 4 個字元');
      return false;
    }

    return true;
  },

  /**
   * 驗證註冊表單
   * @param {string} username - 用戶名
   * @param {string} password - 密碼
   * @param {string} confirmPassword - 確認密碼
   * @param {string} email - 電子郵件
   * @returns {boolean} 驗證是否通過
   */
  validateSignupForm(username, password, confirmPassword, email) {
    if (!username) {
      this.showSignupError('請輸入用戶名');
      return false;
    }

    if (!password) {
      this.showSignupError('請輸入密碼');
      return false;
    }

    if (!confirmPassword) {
      this.showSignupError('請確認密碼');
      return false;
    }

    if (!email) {
      this.showSignupError('請輸入電子郵件');
      return false;
    }

    if (username.length < 3) {
      this.showSignupError('用戶名至少需要 3 個字元');
      return false;
    }

    if (password.length < 4) {
      this.showSignupError('密碼至少需要 4 個字元');
      return false;
    }

    if (password !== confirmPassword) {
      this.showSignupError('兩次輸入的密碼不一致');
      return false;
    }

    // 簡單的電子郵件驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showSignupError('請輸入有效的電子郵件地址');
      return false;
    }

    return true;
  }
};

// 預設匯出
export default LoginPageInit;
