const BASE = '/api';

function getToken() {
  return localStorage.getItem('yss_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Fout opgetreden');
  return data;
}

export const api = {
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body }),
    register: (body) => request('/auth/register', { method: 'POST', body }),
    me: () => request('/auth/me'),
  },
  listings: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/listings${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/listings/${id}`),
    create: (body) => request('/listings', { method: 'POST', body }),
    cancel: (id) => request(`/listings/${id}/cancel`, { method: 'PATCH' }),
    mine: () => request('/listings/my/listings'),
  },
  requests: {
    create: (body) => request('/requests', { method: 'POST', body }),
    received: () => request('/requests/received'),
    sent: () => request('/requests/sent'),
    accept: (id, body) => request(`/requests/${id}/accept`, { method: 'POST', body }),
    reject: (id) => request(`/requests/${id}/reject`, { method: 'POST' }),
  },
  deals: {
    list: () => request('/deals'),
    complete: (id) => request(`/deals/${id}/complete`, { method: 'PATCH' }),
  },
  notifications: {
    list: () => request('/notifications'),
    unreadCount: () => request('/notifications/unread-count'),
    markRead: (ids) => request('/notifications/mark-read', { method: 'POST', body: { ids } }),
  },
};
