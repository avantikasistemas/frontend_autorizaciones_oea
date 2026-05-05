const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'No fue posible completar la operación')
  }

  return data
}

export const getCurrentUser = () => request('/me')
export const listRequests = () => request('/requests')
export const listMyRequests = () => request('/requests/mine')

export const createRequest = (payload) =>
  request('/requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

export const approveRequest = (id) =>
  request(`/requests/${id}/approve`, {
    method: 'POST'
  })

export const rejectRequest = (id) =>
  request(`/requests/${id}/reject`, {
    method: 'POST'
  })

export const activateRequest = (id) =>
  request(`/requests/${id}/activate`, {
    method: 'POST'
  })
