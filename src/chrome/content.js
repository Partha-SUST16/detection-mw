const messagesFromReactAppListener = (message, sender, response) => {
    console.log('[content.js]. message received',{message, sender});
    // eslint-disable-next-line no-undef
    if(sender.id === chrome.runtime.id && message.from === 'React' && message.message === 'Hello from React') {
        response('Hello from content.js');
    }
    // eslint-disable-next-line no-undef
    if(sender.id === chrome.runtime.id && message.from === 'React' && message.message === 'delete logo') {
        const logo = document.getElementById('hplogo');
        logo.parentElement.removeChild(logo)
    }
}
// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);