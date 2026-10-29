// MEPify for iOS — by Mohamed Shafaf Karumannil
// Entry point. The whole calculator is the web app bundled in "www" (copied from the repo at build time),
// shown full-screen in a WKWebView. Works fully offline.

import SwiftUI

@main
struct MEPifyApp: App {
    var body: some Scene {
        WindowGroup {
            WebContainer()
                .ignoresSafeArea()   // the page handles notch and home-bar spacing itself (viewport-fit=cover)
        }
    }
}

struct WebContainer: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> WebViewController { WebViewController() }
    func updateUIViewController(_ controller: WebViewController, context: Context) {}
}
