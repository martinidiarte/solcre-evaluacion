export function authHeaders() {
    const token = sessionStorage.getItem('access_token')

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

export async function authFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...authHeaders(),
            ...options.headers
        }
    })

    if (response.status === 401) {
        sessionStorage.removeItem('access_token')
        window.location.href = '/admin/login'
        return null
    }

    return response
}