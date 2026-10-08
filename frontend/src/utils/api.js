/**
 * Safely parse JSON from a fetch Response without throwing SyntaxError
 * on empty response bodies or non-JSON payloads.
 */
export async function parseJsonResponse(response) {
  if (!response) return null
  try {
    const text = await response.text()
    if (!text || !text.trim()) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Perform a fetch request and safely parse the JSON response.
 * Handles network failures and invalid/empty responses gracefully.
 */
export async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options)
    const data = await parseJsonResponse(response)
    return {
      ok: response.ok,
      status: response.status,
      data,
      response,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error,
    }
  }
}
