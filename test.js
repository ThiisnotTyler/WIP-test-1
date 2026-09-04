const originalAddEventListener = window.addEventListener;
window.addEventListener = function(type, listener, options) {
  if (type === 'unhandledrejection' || type === 'error') {
    const wrappedListener = function(event) {
      const msg = event.reason ? String(event.reason) : String(event.message);
      if (msg.includes('The play() request was interrupted') || msg.includes('AbortError')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      return listener.apply(this, arguments);
    };
    return originalAddEventListener.call(this, type, wrappedListener, options);
  }
  return originalAddEventListener.call(this, type, listener, options);
};
