// MEPify for iOS — by Mohamed Shafaf Karumannil
// Shows the bundled web app and gives it the same native helpers the Android app has
// (window.SiteCalcNative: share, save a file, print), plus a left-edge swipe for Back.

import UIKit
import WebKit

final class WebViewController: UIViewController {
    private var web: WKWebView!
    private let selfTest = ProcessInfo.processInfo.arguments.contains("-MEPifySelfTest")

    /// Page background, matching the app's light and dark themes (shown before the page draws).
    private static let pageBackground = UIColor { t in
        t.userInterfaceStyle == .dark
            ? UIColor(red: 0x0B / 255, green: 0x16 / 255, blue: 0x20 / 255, alpha: 1)
            : UIColor(red: 0xF2 / 255, green: 0xF4 / 255, blue: 0xF6 / 255, alpha: 1)
    }

    override func loadView() {
        let content = WKUserContentController()
        content.addUserScript(WKUserScript(source: NativeBridge.script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        if selfTest {
            content.addUserScript(WKUserScript(source: SelfTest.errorCatcher, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        content.add(WeakMessageHandler(self), name: NativeBridge.channel)

        let config = WKWebViewConfiguration()
        config.userContentController = content
        config.websiteDataStore = .default()          // localStorage (job log, settings, projects) persists between launches
        config.dataDetectorTypes = []                 // don't turn numbers into phone links

        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        web.uiDelegate = self
        web.isOpaque = false
        web.backgroundColor = Self.pageBackground
        web.scrollView.backgroundColor = Self.pageBackground
        web.scrollView.contentInsetAdjustmentBehavior = .never
        #if DEBUG
        if #available(iOS 16.4, *) { web.isInspectable = true }   // Safari > Develop menu, debug builds only
        #endif

        let edge = UIScreenEdgePanGestureRecognizer(target: self, action: #selector(edgeSwipe(_:)))
        edge.edges = .left
        web.addGestureRecognizer(edge)

        view = web
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadBundledApp()
    }

    private func loadBundledApp() {
        guard let www = Bundle.main.url(forResource: "www", withExtension: nil) else {
            web.loadHTMLString("<h2 style='font-family:-apple-system;padding:40px'>App files are missing from this build.</h2>", baseURL: nil)
            return
        }
        web.loadFileURL(www.appendingPathComponent("index.html"), allowingReadAccessTo: www)
    }

    /// Swipe in from the left edge = the app's Back (closes a sheet, leaves a tool, or goes up a level).
    @objc private func edgeSwipe(_ g: UIScreenEdgePanGestureRecognizer) {
        guard g.state == .ended, g.translation(in: view).x > 60 else { return }
        web.evaluateJavaScript("(window.scBack && window.scBack()) ? 1 : 0", completionHandler: nil)
    }

    // MARK: Native helpers called from the page

    fileprivate func handle(_ body: Any) {
        guard let m = body as? [String: Any], let cmd = m["cmd"] as? String else { return }
        switch cmd {
        case "share":
            let title = m["title"] as? String ?? "MEPify"
            let text = m["text"] as? String ?? ""
            present(items: [text], subject: title)
        case "save":
            let name = (m["name"] as? String ?? "MEPify.txt").replacingOccurrences(of: "/", with: "-")
            let content = m["content"] as? String ?? ""
            let url = FileManager.default.temporaryDirectory.appendingPathComponent(name)
            do {
                try content.write(to: url, atomically: true, encoding: .utf8)
                present(items: [url], subject: name)      // "Save to Files", Mail, WhatsApp…
            } catch {
                present(items: [content], subject: name)
            }
        case "print":
            let info = UIPrintInfo(dictionary: nil)
            info.jobName = m["job"] as? String ?? "MEPify"
            info.outputType = .general
            let pc = UIPrintInteractionController.shared
            pc.printInfo = info
            pc.printFormatter = web.viewPrintFormatter()
            pc.present(animated: true, completionHandler: nil)   // includes Save as PDF
        default:
            break
        }
    }

    private func present(items: [Any], subject: String) {
        let vc = UIActivityViewController(activityItems: items, applicationActivities: nil)
        vc.setValue(subject, forKey: "subject")
        if let pop = vc.popoverPresentationController {           // iPad
            pop.sourceView = view
            pop.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.maxY - 80, width: 1, height: 1)
        }
        present(vc, animated: true)
    }
}

// MARK: - Navigation: keep app pages inside, open everything else (mailto, WhatsApp, LinkedIn…) outside

extension WebViewController: WKNavigationDelegate, WKUIDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { return decisionHandler(.cancel) }
        if url.isFileURL || url.scheme == "about" || url.scheme == "blob" || url.scheme == "data" {
            return decisionHandler(.allow)
        }
        UIApplication.shared.open(url)
        decisionHandler(.cancel)
    }

    // target="_blank" links
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = action.request.url { UIApplication.shared.open(url) }
        return nil
    }

    // If iOS stops the page in the background, reload instead of showing a blank screen.
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { loadBundledApp() }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if selfTest { SelfTest.run(on: webView) }
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        present(a, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
        a.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        present(a, animated: true)
    }
}

// MARK: - Bridge

enum NativeBridge {
    static let channel = "mepify"
    /// Same API the Android app exposes, so the web code needs no iOS-specific branches.
    static let script = """
    (function(){
      var post=function(m){try{window.webkit.messageHandlers.\(channel).postMessage(m)}catch(e){}};
      window.SiteCalcNative={
        platform:"iOS app",
        share:function(t,x){post({cmd:"share",title:String(t||"MEPify"),text:String(x||"")})},
        save:function(n,mime,c){post({cmd:"save",name:String(n),mime:String(mime||"text/plain"),content:String(c||"")});return "Choose where to save "+n},
        print:function(j){post({cmd:"print",job:String(j||"MEPify")})}
      };
    })();
    """
}

/// Avoids a retain cycle between WKUserContentController and the view controller.
private final class WeakMessageHandler: NSObject, WKScriptMessageHandler {
    weak var target: WebViewController?
    init(_ target: WebViewController) { self.target = target }
    func userContentController(_ c: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.handle(message.body)
    }
}
