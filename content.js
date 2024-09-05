// Function to add the dropdown menu
function addDropdownMenu() {
  const textarea = document.querySelector('#prompt-textarea');
  if (!textarea) {
    console.error('Textarea not found');
    return;
  }

  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'relative';

  const dropdownInnerContainer = document.createElement('div');
  dropdownInnerContainer.className = 'flex flex-col';

  const dropdownButton = document.createElement('button');
  dropdownButton.className = 'flex items-center justify-center h-8 w-8 rounded-full text-token-text-primary dark:text-white focus-visible:outline-black dark:focus-visible:outline-white mb-1 ml-1.5';
  dropdownButton.title = 'Select saved prompt';
  dropdownButton.setAttribute('aria-label', 'Select saved prompt');
  dropdownButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>';

  const dropdownContent = document.createElement('div');
  dropdownContent.className = 'prompt-dropdown-content';

  dropdownInnerContainer.appendChild(dropdownButton);
  dropdownContainer.appendChild(dropdownInnerContainer);
  document.body.appendChild(dropdownContent);

  // Find the attachment button and insert our dropdown button after it
  const attachmentButton = textarea.parentNode.parentNode.querySelector('button[aria-label="Dosya ekle"]');
  if (attachmentButton) {
    attachmentButton.parentNode.insertBefore(dropdownContainer, attachmentButton.nextSibling);
  } else {
    textarea.parentNode.parentNode.insertBefore(dropdownContainer, textarea.parentNode.parentNode.firstChild);
  }

  // Toggle dropdown visibility
  dropdownButton.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const rect = dropdownButton.getBoundingClientRect();
    if (dropdownContent.style.display === 'none' || dropdownContent.style.display === '') {
      dropdownContent.style.display = 'block';
      dropdownContent.style.position = 'fixed';
      // Position the dropdown above the button
      dropdownContent.style.bottom = `${window.innerHeight - rect.top + window.scrollY}px`;
      dropdownContent.style.left = `${rect.left + window.scrollX}px`;
      loadSavedPrompts();
    } else {
      dropdownContent.style.display = 'none';
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
          <div class="flex items-center justify-between w-full">
            <div class="flex-grow">${prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '')}</div>
            <button class="delete-prompt-btn" data-index="${index}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        `;
        promptElement.addEventListener('click', function (e) {
          if (!e.target.closest('.delete-prompt-btn')) {
            const textarea = document.querySelector('#prompt-textarea');
            textarea.value = prompt;
            resizeTextarea(textarea);
            dropdownContent.style.display = 'none';
          }
        });
        dropdownContent.appendChild(promptElement);
      });

      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-prompt-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const index = parseInt(this.getAttribute('data-index'));
          deletePrompt(index);
        });
      });
    }

    // Call updateColors instead of onDropdownShow
    updateColors();
  });
}

// Add this new function to resize the textarea
function resizeTextarea(textarea) {
  // Reset the height to auto to get the correct scrollHeight
  textarea.style.height = 'auto';
  // Set the height to the scrollHeight
  textarea.style.height = textarea.scrollHeight + 'px';
  // Dispatch an input event to trigger any listeners
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// Function to delete a prompt
function deletePrompt(index) {
  chrome.storage.sync.get('savedPrompts', function (data) {
    const savedPrompts = data.savedPrompts || [];
    savedPrompts.splice(index, 1);
    chrome.storage.sync.set({ savedPrompts: savedPrompts }, function () {
      console.log('Prompt deleted');
      loadSavedPrompts(); // Reload the prompts list
    });
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

// Function to add the save and send button
function addSaveAndSendButton() {
  var textarea = document.querySelector('#prompt-textarea');
  if (!textarea) return;

  var saveAndSendButton = document.createElement('button');
  saveAndSendButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  `;
  saveAndSendButton.className = 'save-and-send-button mb-1 me-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:outline-black disabled:text-[#f4f4f4] disabled:hover:opacity-100 dark:bg-white dark:text-black dark:focus-visible:outline-white disabled:dark:bg-token-text-quaternary dark:disabled:text-token-main-surface-secondary disabled:bg-[#D7D7D7]';
  saveAndSendButton.setAttribute('aria-label', 'Save and send prompt');
  saveAndSendButton.setAttribute('data-testid', 'save-and-send-button');
  saveAndSendButton.title = 'Save and send';
  saveAndSendButton.disabled = true; // Initially disable the button

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

  // Add event listener to textarea to enable/disable the button
  textarea.addEventListener('input', function () {
    saveAndSendButton.disabled = textarea.value.trim().length === 0;
  });
}

// Update the addStyles function to include styles for the disabled state
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
      background-color: var(--hover-color);
    }
    .prompt-dropdown-button svg {
      width: 16px;
      height: 16px;
    }
    .prompt-dropdown-content {
      display: none;
      position: fixed;
      min-width: 340px;
      max-width: 400px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      border-radius: 12px;
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--scroll-thumb-color) var(--scroll-track-color);
      border: 1px solid var(--border-color);
      padding: 8px 0;
      background-color: var(--background-color, #ffffff) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      opacity: 1 !important;
      bottom: 100%;
      margin-bottom: 5px;
    }
    .prompt-dropdown-content::-webkit-scrollbar {
      width: 8px;
    }
    .prompt-dropdown-content::-webkit-scrollbar-track {
      background: var(--scroll-track-color);
      border-radius: 10px;
    }
    .prompt-dropdown-content::-webkit-scrollbar-thumb {
      background-color: var(--scroll-thumb-color);
      border-radius: 10px;
      border: 2px solid var(--scroll-track-color);
    }
    .saved-prompt-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.3s;
      color: var(--text-color);
      margin: 6px 8px;
      border-radius: 6px;
    }
    .saved-prompt-item:hover {
      background-color: var(--hover-color);
    }
    .no-prompts-message {
      color: var(--text-color);
      padding: 12px 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      font-size: 14px;
      text-align: center;
    }
    .save-and-send-button svg {
      width: 20px;
      height: 20px;
    }
    .save-and-send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .delete-prompt-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-left: 8px;
      color: var(--text-color);
      opacity: 0.7;
      transition: opacity 0.3s;
    }
    .delete-prompt-btn:hover {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  function updateColors() {
    const isDarkMode = document.body.classList.contains('dark');
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-default').trim();
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-default').trim();

    // Adjust background and text colors
    const backgroundColor = isDarkMode ? '#2C2C2E' : '#F2F2F7';
    const dropdownTextColor = isDarkMode ? '#FFFFFF' : '#1C1C1E';
    const hoverColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.documentElement.style.setProperty('--text-color', dropdownTextColor);
    document.documentElement.style.setProperty('--border-color', borderColor);
    document.documentElement.style.setProperty('--hover-color', hoverColor);

    const buttons = document.querySelectorAll('.prompt-dropdown-button, .save-and-send-button');
    buttons.forEach(button => {
      button.style.color = textColor;
    });

    // Update the dropdown content background color and text color
    const dropdownContent = document.querySelector('.prompt-dropdown-content');
    if (dropdownContent) {
      dropdownContent.style.backgroundColor = backgroundColor;
      dropdownContent.style.color = dropdownTextColor;
    }

    // Add scroll colors
    const scrollThumbColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
    const scrollTrackColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    document.documentElement.style.setProperty('--scroll-thumb-color', scrollThumbColor);
    document.documentElement.style.setProperty('--scroll-track-color', scrollTrackColor);
  }

  // Initial color update
  updateColors();

  // Watch for theme changes
  const observer = new MutationObserver(updateColors);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
