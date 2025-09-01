(function () {
  var containerId = 'toast-container';

  function ensureContainer() {
    var container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    return container;
  }

  function createToast(message, options) {
    var opts = options || {};
    var type = opts.type || 'default';
    var duration = (typeof opts.duration === 'number') ? opts.duration : 3000;
    var dismissible = opts.dismissible !== false; // default true

    var container = ensureContainer();

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    var content = document.createElement('div');
    content.className = 'toast-content';
    content.textContent = String(message || '');
    toast.appendChild(content);

    if (dismissible) {
      var close = document.createElement('button');
      close.className = 'toast-close';
      close.setAttribute('aria-label', 'Đóng');
      close.textContent = '×';
      close.addEventListener('click', function () { removeToast(toast); });
      toast.appendChild(close);
    }

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    if (duration > 0) {
      setTimeout(function () { removeToast(toast); }, duration);
    }

    return toast;
  }

  function removeToast(el) {
    if (!el) return;
    el.classList.remove('show');
    el.classList.add('hide');
    el.addEventListener('transitionend', function onEnd() {
      el.removeEventListener('transitionend', onEnd);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }

  window.toast = {
    show: function (message, options) { return createToast(message, options); },
    success: function (message, options) { return createToast(message, merge(options, { type: 'success' })); },
    error: function (message, options) { return createToast(message, merge(options, { type: 'error' })); },
    info: function (message, options) { return createToast(message, merge(options, { type: 'info' })); },
    warn: function (message, options) { return createToast(message, merge(options, { type: 'warning' })); }
  };

  function merge(a, b) {
    var out = {};
    var k;
    a = a || {};
    b = b || {};
    for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) out[k] = a[k];
    for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) out[k] = b[k];
    return out;
  }
})();


