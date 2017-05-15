const SmimePluginEdge = require('./SmimePluginEdge');
const SmimePluginPKI = require('./SmimePluginPKI');
const handleLogin = require('./login.js');

if (window.location.pathname.endsWith('/auth/logon.aspx')) {
    handleLogin();
} else {
    var _docWrite = window.document.write.bind(window.document);
    window.document.write = function(s) {
        _docWrite(s);
        if (s.indexOf('globalize/globalize.culture.de-de.js') > 0) {
            owaInit();
        }
    };

    function owaInit() {
        console.log("init");

        _a.UserAgent.getInstance().$3IJ = true;  // Is Firefox
        _a.UserAgent.getInstance().$4IL = 1;     // Firefox plugin version
        
        const SmimePluginBase = _a.SmimePluginFirefox.__baseType;
        _a.SmimePluginFirefox = function() {
            let plg;
            try {
                plg = new SmimePluginEdge();
            } catch (e) {
                // .NET libraries are probably missing
                console.warn(e);
                plg = new SmimePluginPKI();
            }
            return new SmimePluginBase(plg);
        }
        /*console.log(_a.$c.$3e);
        _a.$c.$3e = function(n, t, i) {
            console.log("Register SmimePlugin");
            _a.$c.$NS = t;
            _a.$c.$3IP = i;
            _a.$c.$1aM = n;
            _a.$c.$8PU(new SmimePluginBase(new SmimePlugin()));
        };*/
        
        var _main = Program.main;
        Program.main = function(n, t) {
            console.info(n, t);
            //n.featuresSupported = ["AllFlights"];
            n.featuresSupported.push("SmimeConversation");
            n.pageUrl = window.location.href + '&traceLevel=5'
            _main(n, t);
        };
    }
}
