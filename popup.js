document.getElementById('exportCookies').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const url = new URL(activeTab.url);

    chrome.cookies.getAll({ url: url.origin }, (cookies) => {
      const json = JSON.stringify(cookies, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'cookies.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });
});

document.getElementById('importCookies').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const cookies = JSON.parse(e.target.result);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const url = new URL(activeTab.url);

      cookies.forEach(cookie => {
        chrome.cookies.set({
          url: url.origin,
          name: cookie.name,
          value: cookie.value,
          expirationDate: cookie.expirationDate || (new Date().getTime() / 1000) + 3600,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly
        }, (setCookie) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            console.log('Cookie imported:', setCookie);
          }
        });
      });
    });
  };
  reader.readAsText(file);
});
