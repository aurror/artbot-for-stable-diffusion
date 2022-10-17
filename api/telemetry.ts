export const trackEvent = async (obj = {}) => {
  if (
    typeof window !== 'undefined' &&
    window.location.host.indexOf('localhost') >= 0
  ) {
    return
  }

  try {
    await fetch(`/artbot/api/telemetry`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    // If nothing happens, it's fine to ignore this.
  }
}