// MEPify for iOS — by Mohamed Shafaf Karumannil
// Automatic check used by the GitHub build (only when launched with -MEPifySelfTest; does nothing otherwise).
// Opens every tool in Safari's engine, records any script error, and checks that saved data survives a relaunch.
// The result is written to Documents/selftest.json inside the app's container.

import WebKit

enum SelfTest {
    static let errorCatcher = """
    window.__mepErr=[];
    window.addEventListener("error",function(e){window.__mepErr.push(String(e.message)+" @"+(e.filename||"").split("/").pop()+":"+e.lineno)});
    window.addEventListener("unhandledrejection",function(e){window.__mepErr.push("promise: "+String(e.reason))});
    """

    private static let js = """
    (function(){
      var r={app:typeof APPV!=="undefined"?APPV:null,ua:navigator.userAgent};
      try{r.savedBefore=localStorage.getItem("mepify-selftest");}catch(e){r.savedBefore="error: "+e;}
      r.tools=typeof TOOLS!=="undefined"?TOOLS.length:0;r.opened=0;r.toolErrors=[];
      if(typeof TOOLS!=="undefined"){TOOLS.forEach(function(t){try{BACK="home";openTool(t.id);r.opened++;}catch(e){r.toolErrors.push(t.id+": "+e.message);}});}
      try{BACK="home";go("home");}catch(e){}
      try{r.faults=FAULTS.length;}catch(e){r.faults="n/a";}
      r.scriptErrors=window.__mepErr||[];
      r.native=!!(window.SiteCalcNative&&window.SiteCalcNative.platform==="iOS app");
      r.safeTop=getComputedStyle(document.body).paddingTop;
      try{localStorage.setItem("mepify-selftest",String(Date.now()));r.savedNow=true;}catch(e){r.savedNow=false;}
      return JSON.stringify(r);
    })()
    """

    static func run(on web: WKWebView) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            web.evaluateJavaScript(js) { value, error in
                let text = (value as? String) ?? "{\"error\":\"\(String(describing: error))\"}"
                let url = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                    .appendingPathComponent("selftest.json")
                try? text.write(to: url, atomically: true, encoding: .utf8)
                print("MEPIFY_SELFTEST \(text)")
            }
        }
    }
}
