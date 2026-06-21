(function() {
  // 1. Identify the script element and extract configuration attributes
  const currentScript = document.currentScript || Array.from(document.getElementsByTagName('script')).find(
    s => s.src.includes('/embed.js')
  );

  if (!currentScript) {
    console.error('EasyDev Widget script element not found.');
    return;
  }

  const tenantId = currentScript.getAttribute('data-tenant-id');
  if (!tenantId) {
    console.error('EasyDev Widget missing required attribute: data-tenant-id');
    return;
  }

  const baseUrl = currentScript.src.replace('/embed.js', '');

  // 2. Create the widget iframe container
  const iframe = document.createElement('iframe');
  iframe.id = 'easydev-chat-widget-frame';
  iframe.src = `${baseUrl}/embed?tenantId=${encodeURIComponent(tenantId)}`;
  
  // Style the iframe as a small floating launcher initially
  const widgetStyles = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '80px',
    height: '80px',
    border: 'none',
    margin: '0',
    padding: '0',
    overflow: 'hidden',
    zIndex: '999999',
    background: 'transparent',
    colorScheme: 'light'
  };

  Object.assign(iframe.style, widgetStyles);

  // Allow fullscreen mode for documents viewer if necessary
  iframe.setAttribute('allow', 'camera;microphone;fullscreen');

  // 3. Append to body
  document.body.appendChild(iframe);

  // 4. Listen to postMessages to toggle resizing
  window.addEventListener('message', function(event) {
    // Only process messages coming from our widget domain
    if (event.origin !== baseUrl) return;

    const data = event.data;
    if (data && data.event === 'widget:toggle') {
      if (data.open) {
        // Expand iframe to show full widget window
        iframe.style.width = '410px';
        iframe.style.height = '670px';
      } else {
        // Collapse back to launcher size
        iframe.style.width = '80px';
        iframe.style.height = '80px';
      }
    }
  });
})();
