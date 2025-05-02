import API from '../api';  // adjust your path if needed
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);  // We mock base Axios because refresh uses raw axios

describe('API Interceptors', () => {
  let apiMock;

  beforeEach(() => {
    apiMock = new MockAdapter(API);
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('attaches token to request if available', async () => {
    localStorage.setItem('accessToken', 'test-token');

    apiMock.onGet('/test').reply(200, { success: true });

    const response = await API.get('/test');

    expect(response.data).toEqual({ success: true });
    // Check if Authorization header is set
    expect(apiMock.history.get[0].headers.Authorization).toBe('Bearer test-token');
  });

  it('handles 401 and refreshes token successfully', async () => {
    localStorage.setItem('accessToken', 'old-token');
    localStorage.setItem('refreshToken', 'refresh-token');

    // First request fails with 401
    apiMock.onGet('/test').replyOnce(401);

    // Refresh token request succeeds
    mock.onPost('https://community-sustainability-engine.onrender.com/api/accounts/token/refresh/')
        .reply(200, { access: 'new-token' });

    // Retried request succeeds
    apiMock.onGet('/test').reply(200, { success: true });

    const response = await API.get('/test');

    expect(response.data).toEqual({ success: true });
    expect(localStorage.getItem('accessToken')).toBe('new-token');
  });

  it('handles 401 and fails refresh, forcing logout', async () => {
    localStorage.setItem('accessToken', 'old-token');
    localStorage.setItem('refreshToken', 'refresh-token');

    apiMock.onGet('/test').replyOnce(401);

    mock.onPost('https://community-sustainability-engine.onrender.com/api/accounts/token/refresh/')
        .reply(400);  // refresh fails

    delete window.location;
    window.location = { href: '' };  // mock window.location

    await expect(API.get('/test')).rejects.toThrow();

    expect(localStorage.getItem('accessToken')).toBe(null);
    expect(localStorage.getItem('refreshToken')).toBe(null);
    expect(window.location.href).toBe('/login');
  });

  it('handles 403 and forces logout', async () => {
    localStorage.setItem('accessToken', 'old-token');
    localStorage.setItem('refreshToken', 'refresh-token');

    apiMock.onGet('/test').reply(403);

    delete window.location;
    window.location = { href: '' };  // mock window.location

    await expect(API.get('/test')).rejects.toThrow();

    expect(localStorage.getItem('accessToken')).toBe(null);
    expect(localStorage.getItem('refreshToken')).toBe(null);
    expect(window.location.href).toBe('/login');
  });

  it('handles network error gracefully', async () => {
    apiMock.onGet('/test').networkError();

    await expect(API.get('/test')).rejects.toEqual({
      message: 'Network Error. Please check your internet connection.'
    });
  });

  it('queues multiple 401 requests during token refresh', async () => {
    localStorage.setItem('accessToken', 'old-token');
    localStorage.setItem('refreshToken', 'refresh-token');

    // Both requests fail with 401 initially
    apiMock.onGet('/test1').replyOnce(401);
    apiMock.onGet('/test2').replyOnce(401);

    // Mock refresh token success
    mock.onPost('https://community-sustainability-engine.onrender.com/api/accounts/token/refresh/')
        .reply(200, { access: 'new-token' });

    // Both retried requests succeed
    apiMock.onGet('/test1').reply(200, { success: true });
    apiMock.onGet('/test2').reply(200, { success: true });

    const [res1, res2] = await Promise.all([
      API.get('/test1'),
      API.get('/test2')
    ]);

    expect(res1.data).toEqual({ success: true });
    expect(res2.data).toEqual({ success: true });
    expect(localStorage.getItem('accessToken')).toBe('new-token');
  });
});
