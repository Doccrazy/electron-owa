function addLoginListeners() {
    document.addEventListener('DOMContentLoaded', function() {
        const _clkLgn = clkLgn;
        clkLgn = function() {
            localStorage.setItem('owaPassword', document.getElementById('password').value);
            _clkLgn();
        };
        
        const _onload = window.onload;
        window.onload = function() {
            _onload();
            const pw = localStorage.getItem('owaPassword');
            if (!document.getElementById('signInErrorDiv') && document.getElementById('username').value && pw) {
                document.getElementById('password').value = pw;
                clkLgn();
            } else {
                localStorage.removeItem('owaPassword');
            }
        }
    });
}

module.exports = addLoginListeners;
