export function isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000 // convert to ms
      return Date.now() > exp
    } catch {
      return true
    }
  }
  