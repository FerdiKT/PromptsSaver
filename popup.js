document.addEventListener('DOMContentLoaded', function () {
  loadSavedPrompts();
  setTheme();
});

function loadSavedPrompts() {
  chrome.storage.sync.get('savedPrompts', function (data) {
    const savedPrompts = data.savedPrompts || [];
    const promptList = document.getElementById('promptList');
    promptList.innerHTML = '';

    if (savedPrompts.length === 0) {
      promptList.innerHTML = '<div class="no-prompts-message">No saved prompts</div>';
    } else {
      savedPrompts.forEach((prompt, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div>${prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '')}</div>
          <button class="delete-btn" data-index="${index}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
            </svg>
          </button>
        `;
        promptList.appendChild(li);
      });
    }

    addDeleteListeners();
  });
}

function addDeleteListeners() {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      deletePrompt(index);
    });
  });
}

function deletePrompt(index) {
  chrome.storage.sync.get('savedPrompts', function (data) {
    const savedPrompts = data.savedPrompts || [];
    savedPrompts.splice(index, 1);
    chrome.storage.sync.set({ savedPrompts: savedPrompts }, function () {
      loadSavedPrompts();
    });
  });
}

function setTheme() {
  // You can add logic here to detect and set the theme
  // For now, we'll use a light theme
  document.body.style.setProperty('--background-color', '#E5E5EA');
  document.body.style.setProperty('--text-color', '#1C1C1E');
  document.body.style.setProperty('--hover-color', 'rgba(0, 0, 0, 0.05)');
  document.body.style.setProperty('--scroll-thumb-color', 'rgba(0, 0, 0, 0.3)');
  document.body.style.setProperty('--scroll-track-color', 'rgba(0, 0, 0, 0.1)');
}
