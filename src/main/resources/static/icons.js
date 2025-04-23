// Register Lucide Icons
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// If any icon is dynamically added to the DOM, refresh icons
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length && typeof lucide !== 'undefined') {
            lucide.createIcons({
                icons: {
                    // Common icons used in the chat interface
                    send: true,
                    bot: true,
                    plus: true,
                    paperclip: true,
                    settings: true,
                    share: true,
                    search: true,
                    'chevron-left': true,
                    'chevron-right': true,
                    trash: true,
                    edit: true,
                    copy: true,
                    'message-square': true,
                    'log-out': true,
                    'alert-circle': true,
                    'check-circle': true,
                    'x-circle': true,
                    download: true,
                    'external-link': true,
                }
            });
        }
    });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });
