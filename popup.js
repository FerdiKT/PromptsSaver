document.addEventListener('DOMContentLoaded', function() {
  const promptList = document.getElementById('promptList');

  function loadPrompts() {
    chrome.storage.sync.get('savedPrompts', (data) => {
      const savedPrompts = data.savedPrompts || [];
      promptList.innerHTML = '';
      savedPrompts.forEach((prompt, index) => {
        const li = document.createElement('li');
        li.textContent = prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '');
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
          savedPrompts.splice(index, 1);
          chrome.storage.sync.set({ savedPrompts }, loadPrompts);
        };

        li.appendChild(deleteButton);
        promptList.appendChild(li);
      });
    });
  }

  loadPrompts();
});
