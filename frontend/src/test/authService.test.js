import authService from '../services/authService';
import API from '../api';

jest.mock('../api', () => ({
  post: jest.fn()
}));

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login()', () => {
    it('should store tokens on successful login', async () => {
      API.post.mockResolvedValue({
        data: { access: 'fake-access', refresh: 'fake-refresh' }
      });

      const result = await authService.login('test@example.com', 'password');

      expect(API.post).toHaveBeenCalledWith('token/', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(localStorage.getItem('accessToken')).toBe('fake-access');
      expect(localStorage.getItem('refreshToken')).toBe('fake-refresh');
      expect(result).toEqual({ access: 'fake-access', refresh: 'fake-refresh' });
    });

    it('should throw and not store tokens on failed login', async () => {
      API.post.mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } }
      });

      await expect(authService.login('fail@example.com', 'wrong')).rejects.toBeTruthy();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('register()', () => {
    it('should return registered user data', async () => {
      const mockUser = { id: 1, email: 'john@example.com' };
      API.post.mockResolvedValue({ data: mockUser });

      const result = await authService.register({ email: 'john@example.com', password: 'pass123' });

      expect(API.post).toHaveBeenCalledWith('register/', {
        email: 'john@example.com',
        password: 'pass123',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error on failed registration', async () => {
      API.post.mockRejectedValue({
        response: { data: { message: 'Registration failed' } }
      });

      await expect(authService.register({})).rejects.toBeTruthy();
    });
  });

  describe('logout()', () => {
    it('should clear access and refresh tokens', () => {
      localStorage.setItem('accessToken', '123');
      localStorage.setItem('refreshToken', '456');

      authService.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('refreshToken()', () => {
    it('should refresh token and store new access token', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh');
      API.post.mockResolvedValue({ data: { access: 'new-access-token' } });

      const token = await authService.refreshToken();

      expect(API.post).toHaveBeenCalledWith('token/refresh/', {
        refresh: 'valid-refresh',
      });
      expect(token).toBe('new-access-token');
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    });

    it('should throw error if no refresh token is present', async () => {
      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
    });
  });

  describe('getAccessToken()', () => {
    it('should return the access token', () => {
      localStorage.setItem('accessToken', 'abc123');
      expect(authService.getAccessToken()).toBe('abc123');
    });

    it('should return null if not found', () => {
      expect(authService.getAccessToken()).toBeNull();
    });
  });

  describe('isAuthenticated()', () => {
    it('returns true if valid token exists', () => {
      localStorage.setItem('accessToken', 'abc123');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false if token is undefined, null or missing', () => {
      localStorage.setItem('accessToken', 'undefined');
      expect(authService.isAuthenticated()).toBe(false);

      localStorage.setItem('accessToken', 'null');
      expect(authService.isAuthenticated()).toBe(false);

      localStorage.removeItem('accessToken');
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
