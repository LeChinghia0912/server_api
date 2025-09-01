const api = (function() {
  const baseUrl = '/api/v1';

  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async function request(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders(), options.headers || {});
    const res = await fetch(`${baseUrl}${path}`, { ...options, headers, credentials: 'include' });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (json && (json.message || json.error)) || res.statusText;
      throw new Error(message);
    }
    return json;
  }

  async function get(path) {
    return request(path, { method: 'GET' });
  }

  async function post(path, body) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
  }

  async function put(path, body) {
    return request(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  async function del(path) {
    return request(path, { method: 'DELETE' });
  }

  async function postMultipart(path, formData) {
    const headers = getAuthHeaders();
    const res = await fetch(`${baseUrl}${path}`, { method: 'POST', headers, body: formData, credentials: 'include' });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (json && (json.message || json.error)) || res.statusText;
      throw new Error(message);
    }
    return json;
  }

  async function putMultipart(path, formData) {
    const headers = getAuthHeaders();
    const res = await fetch(`${baseUrl}${path}`, { method: 'PUT', headers, body: formData, credentials: 'include' });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (json && (json.message || json.error)) || res.statusText;
      throw new Error(message);
    }
    return json;
  }

  return { get, post, postMultipart, putMultipart, put, del };
})();


