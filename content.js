// Function to add the dropdown menu
function addDropdownMenu() {
  const textarea = document.querySelector('#prompt-textarea');
  if (!textarea) {
    console.error('Textarea not found');
    return;
  }

  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'prompt-dropdown-container';

  const dropdownButton = document.createElement('button');
  dropdownButton.className = 'prompt-dropdown-button';
  dropdownButton.title = 'Select saved prompt';
  dropdownButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>';

  const dropdownContent = document.createElement('div');
  dropdownContent.className = 'prompt-dropdown-content';

  dropdownContainer.appendChild(dropdownButton);
  document.body.appendChild(dropdownContent);

  // Find the attachment button and insert our dropdown button after it
  const attachmentButton = textarea.parentNode.parentNode.querySelector('button[aria-label="Dosya ekle"]');
  if (attachmentButton) {
    attachmentButton.parentNode.insertBefore(dropdownContainer, attachmentButton.nextSibling);
    dropdownContainer.style.marginLeft = '8px';
  } else {
    textarea.parentNode.parentNode.insertBefore(dropdownContainer, textarea.parentNode.parentNode.firstChild);
  }

  // Toggle dropdown visibility
  dropdownButton.addEventListener('click', function (e) {
    e.preventDefault();
    const rect = dropdownButton.getBoundingClientRect();
    dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'block' : 'none';
    dropdownContent.style.bottom = `${window.innerHeight - rect.top + window.scrollY}px`;
    dropdownContent.style.left = `${rect.left + window.scrollX}px`;
    if (dropdownContent.style.display === 'block') {
      loadSavedPrompts();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (event) {
    if (!dropdownContainer.contains(event.target) && !dropdownContent.contains(event.target)) {
      dropdownContent.style.display = 'none';
    }
  });
}

// Function to load saved prompts
function loadSavedPrompts() {
  chrome.storage.sync.get('savedPrompts', function (data) {
    const savedPrompts = data.savedPrompts || [];
    const dropdownContent = document.querySelector('.prompt-dropdown-content');
    dropdownContent.innerHTML = '';

    if (savedPrompts.length === 0) {
      const noPromptsMsg = document.createElement('div');
      noPromptsMsg.className = 'no-prompts-message';
      noPromptsMsg.textContent = 'No saved prompts';
      dropdownContent.appendChild(noPromptsMsg);
    } else {
      savedPrompts.forEach(function (prompt, index) {
        const promptElement = document.createElement('div');
        promptElement.className = 'saved-prompt-item';
        promptElement.innerHTML = `
          <div class="flex items-center justify-center text-token-text-secondary h-5 w-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 shrink-0">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
            </svg>
          </div>
          <div class="flex flex-col">${prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '')}</div>
        `;
        promptElement.addEventListener('click', function (e) {
          e.preventDefault();
          document.querySelector('#prompt-textarea').value = prompt;
          dropdownContent.style.display = 'none';
        });
        dropdownContent.appendChild(promptElement);
      });
    }
  });
}

// Function to save the current prompt
function saveCurrentPrompt() {
  const textarea = document.querySelector('#prompt-textarea');
  if (!textarea) {
    console.error('Textarea not found');
    return;
  }

  const promptToSave = textarea.value.trim();
  if (promptToSave) {
    chrome.storage.sync.get('savedPrompts', function (data) {
      const savedPrompts = data.savedPrompts || [];
      if (savedPrompts.indexOf(promptToSave) === -1) {
        savedPrompts.push(promptToSave);
        chrome.storage.sync.set({ savedPrompts: savedPrompts }, function () {
          console.log('Prompt saved');
        });
      }
    });
  }
}

// Add the dropdown menu and save button when the page loads
function initializeExtension() {
  addDropdownMenu();
  addSaveAndSendButton();
  addStyles();
}

// Use a MutationObserver to wait for the textarea to be added to the DOM
var observer = new MutationObserver(function (mutations, obs) {
  var textarea = document.querySelector('#prompt-textarea');
  if (textarea) {
    initializeExtension();
    obs.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Add a button to save the current prompt and send
function addSaveAndSendButton() {
  var textarea = document.querySelector('#prompt-textarea');
  if (!textarea) return;

  var saveAndSendButton = document.createElement('button');
  saveAndSendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clip-rule="evenodd" /></svg>';
  saveAndSendButton.className = 'save-and-send-button';
  saveAndSendButton.title = 'Save and send';
  saveAndSendButton.addEventListener('click', function (e) {
    e.preventDefault();
    saveCurrentPrompt();
    // Trigger the original send button click
    const sendButton = textarea.parentNode.parentNode.querySelector('button[data-testid="send-button"]');
    if (sendButton) {
      sendButton.click();
    }
  });

  // Find the send button and insert our save&send button before it
  const sendButton = textarea.parentNode.parentNode.querySelector('button[data-testid="send-button"]');
  if (sendButton) {
    sendButton.parentNode.insertBefore(saveAndSendButton, sendButton);
    // Adjust the margin to align with other buttons
    saveAndSendButton.style.marginRight = '8px';
  } else {
    textarea.parentNode.parentNode.appendChild(saveAndSendButton);
  }
}

function addStyles() {
  var style = document.createElement('style');
  style.textContent = `
    .prompt-dropdown-container {
      position: relative;
      display: inline-block;
    }
    .prompt-dropdown-button {
      background-color: transparent;
      padding: 0;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s, color 0.3s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      position: relative;
      margin-bottom: 1px;
    }
    .prompt-dropdown-button:hover {
      background-color: var(--color-surface-secondary);
    }
    .prompt-dropdown-button svg {
      width: 16px;
      height: 16px;
    }
    .prompt-dropdown-content {
      display: none;
      position: fixed;
      background-color: var(--color-surface-primary);
      min-width: 340px;
      box-shadow: var(--shadow-float);
      border-radius: 12px;
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--color-border-primary);
      padding: 8px 0;
    }
    .saved-prompt-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.3s;
      gap: 10px;
      color: var(--color-text-primary);
    }
    .saved-prompt-item:hover {
      background-color: var(--color-surface-secondary);
    }
    .no-prompts-message {
      color: var(--color-text-primary);
      padding: 12px 16px;
      font-family: var(--font-family-default);
      font-size: 14px;
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  // Function to update colors based on theme
  function updateColors() {
    const dropdownContent = document.querySelector('.prompt-dropdown-content');
    if (dropdownContent) {
      dropdownContent.style.backgroundColor = 'var(--color-surface-primary)';
    }

    const buttons = document.querySelectorAll('.prompt-dropdown-button, .save-and-send-button');
    buttons.forEach(button => {
      button.style.color = 'var(--color-text-primary)';
    });
  }

  // Initial color update
  updateColors();

  // Watch for theme changes
  const observer = new MutationObserver(updateColors);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
