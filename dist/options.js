function save_options() {
  const value = document.getElementById('apiToken').value;
  chrome.storage.local.set({
    apiToken: value,
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.local.get(null, (configs) => {
    document.getElementById('apiToken')
      .value = configs.apiToken || '';
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save')
  .addEventListener('click', save_options);
