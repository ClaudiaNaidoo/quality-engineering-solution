export const LOGIN_USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
  error: {
    username: 'error_user',
    password: 'secret_sauce',
  },
  visual: {
    username: 'visual_user',
    password: 'secret_sauce',
  },
};

export const INVALID_PASSWORD_CREDENTIALS = {
  username: LOGIN_USERS.standard.username,
  password: 'wrong_password',
};

export const LOGIN_ERRORS = {
  lockedOut: 'Sorry, this user has been locked out.',
  invalidCredentials: 'Username and password do not match any user in this service',
  usernameRequired: 'Username is required',
  passwordRequired: 'Password is required',
};

