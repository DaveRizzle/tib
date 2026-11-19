import json
import os
from urllib.parse import unquote

from playwright.sync_api import sync_playwright


BASE = os.environ.get("TIB_PREVIEW_URL", "http://127.0.0.1:8788")
TEST_MEASUREMENT_ID = "G-LOCALQA1234"
PRODUCTION_MEASUREMENT_ID = "G-GMZT51K1VM"


def analytics_request(url: str) -> bool:
    return "googletagmanager.com" in url or "google-analytics.com" in url


def consent_cookie(context):
    return next(cookie for cookie in context.cookies() if cookie["name"] == "tib_consent_v1")


def test_consent_matrix():
    with sync_playwright() as playwright:
        executable = os.environ.get("TIB_BROWSER_EXECUTABLE")
        browser = playwright.chromium.launch(headless=True, executable_path=executable)

        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        requests = []
        page.on("request", lambda request: requests.append(request.url))
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        assert page.get_by_role("button", name="Essential only").is_visible()
        assert page.get_by_role("button", name="Allow analytics").is_visible()
        assert page.get_by_role("button", name="Cookie settings").is_visible()
        assert not any(analytics_request(url) for url in requests)

        page.get_by_role("button", name="Cookie settings").click()
        assert page.get_by_role("dialog").is_visible()
        assert page.evaluate("document.activeElement.id") == "tib-consent-analytics"
        page.keyboard.press("Tab")
        assert page.evaluate("document.activeElement.hasAttribute('data-tib-save')")
        page.keyboard.press("Shift+Tab")
        assert page.evaluate("document.activeElement.id") == "tib-consent-analytics"
        page.keyboard.press("Escape")
        assert not page.get_by_role("dialog").is_visible()

        page.get_by_role("button", name="Essential only").click()
        saved = json.loads(unquote(consent_cookie(context)["value"]))
        assert saved["analytics"] is False
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(300)
        assert not page.locator(".tib-consent-banner").is_visible()
        assert not any(analytics_request(url) for url in requests)

        test_context = browser.new_context(viewport={"width": 1440, "height": 900})
        test_page = test_context.new_page()
        test_requests = []
        test_page.on("request", lambda request: test_requests.append(request.url))
        test_page.route("https://www.googletagmanager.com/**", lambda route: route.abort())
        test_page.route("https://www.google-analytics.com/**", lambda route: route.abort())
        test_page.goto(BASE + f"/?ga4_test_id={TEST_MEASUREMENT_ID}", wait_until="domcontentloaded")
        test_page.wait_for_timeout(300)
        test_page.get_by_role("button", name="Allow analytics").click()
        test_page.wait_for_timeout(1000)
        assert any(f"googletagmanager.com/gtag/js?id={TEST_MEASUREMENT_ID}" in url for url in test_requests)
        assert not any(PRODUCTION_MEASUREMENT_ID in url for url in test_requests)
        assert test_page.evaluate("window.dataLayer.some(x => x[0] === 'event' && x[1] === 'consent_choice')")

        test_page.locator(".tib-consent-settings").first.click(timeout=3000)
        test_page.locator("#tib-consent-analytics").uncheck()
        test_page.get_by_role("button", name="Save choices").click()
        assert test_page.evaluate("window.dataLayer.filter(x => x[0] === 'consent' && x[1] === 'update').at(-1)[2].analytics_storage") == "denied"
        test_context.close()

        expired_context = browser.new_context()
        expired_page = expired_context.new_page()
        expired_page.goto(BASE + "/", wait_until="domcontentloaded")
        expired_page.evaluate("document.cookie = 'tib_consent_v1=%7B%22essential%22%3Atrue%2C%22analytics%22%3Atrue%2C%22noticeVersion%22%3A%222026-11-19-v1%22%2C%22expiresAt%22%3A%222000-01-01T00%3A00%3A00.000Z%22%7D; Path=/; SameSite=Lax'")
        expired_page.reload(wait_until="domcontentloaded")
        assert expired_page.locator(".tib-consent-banner").is_visible()

        gpc_context = browser.new_context()
        gpc_page = gpc_context.new_page()
        gpc_requests = []
        gpc_page.on("request", lambda request: gpc_requests.append(request.url))
        gpc_page.add_init_script("Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', {get: () => true})")
        gpc_page.goto(BASE + "/", wait_until="domcontentloaded")
        assert gpc_page.get_by_role("button", name="Allow analytics").is_disabled()
        assert not any(analytics_request(url) for url in gpc_requests)

        mobile_context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        mobile_page = mobile_context.new_page()
        mobile_page.goto(BASE + "/", wait_until="domcontentloaded")
        box = mobile_page.locator(".tib-consent-banner").bounding_box()
        assert box and box["x"] >= 0 and box["width"] <= 390

        for path in ["/privacy-policy/", "/work-with-me/", "/404_not_found/", "/author/davidr/"]:
            response = page.goto(BASE + path, wait_until="domcontentloaded")
            assert response and response.status == 200
            assert page.locator(".tib-consent-settings").count() >= 1

        home = page.goto(BASE + "/", wait_until="domcontentloaded")
        assert home and home.status == 200
        booking = page.locator('a[href="https://calendar.app.google/ZyW4qWin1iDgaxhX6"]').first
        assert booking.count() == 1

        browser.close()


if __name__ == "__main__":
    test_consent_matrix()
    print("PASS: TIB consent desktop/mobile/GPC/expiry/network/legacy-route matrix")
