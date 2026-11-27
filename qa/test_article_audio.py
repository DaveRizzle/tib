"""Verify the narration loads its duration and supports user-initiated playback."""
import os

from playwright.sync_api import sync_playwright


BASE = os.environ.get("TIB_PREVIEW_URL", "http://127.0.0.1:8788").rstrip("/")
ARTICLE = "/blog/plan-your-strength-training-week/"


def test_article_audio():
    with sync_playwright() as playwright:
        engine = os.environ.get("TIB_BROWSER_ENGINE", "chromium")
        options = {"headless": True}
        if os.environ.get("TIB_BROWSER_EXECUTABLE"):
            options["executable_path"] = os.environ["TIB_BROWSER_EXECUTABLE"]
        browser = getattr(playwright, engine).launch(**options)
        for width, height in [(1440, 1000), (768, 1024), (390, 844), (320, 568)]:
            context = browser.new_context(
                viewport={"width": width, "height": height},
                is_mobile=width <= 768,
                has_touch=width <= 768,
            )
            page = context.new_page()
            requests = []
            page.on("request", lambda request: requests.append(request.url))
            response = page.goto(BASE + ARTICLE, wait_until="networkidle")
            assert response.status == 200
            audio = page.locator(".article-audio audio")
            assert audio.count() == 1
            assert audio.get_attribute("controls") is not None
            assert audio.get_attribute("preload") == "metadata"
            assert audio.get_attribute("autoplay") is None
            assert audio.get_attribute("aria-label")
            assert page.locator(".article-summary").evaluate(
                "summary => summary.nextElementSibling.classList.contains('article-audio')"
            )
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            assert audio.evaluate("a => a.paused && a.currentTime === 0")
            page.wait_for_function("document.querySelector('audio').readyState >= 1")
            assert 680 < audio.evaluate("a => a.duration") < 730
            assert "11 min 43 sec" in page.locator("#audioDescription").inner_text()
            assert page.locator("#audioVersionNote").count() == 0
            assert "Narrated with an AI voice" not in page.locator(".article-audio").inner_text()
            assert "Tables are described aloud" not in page.locator(".article-audio").inner_text()
            assert not any("google-analytics.com" in url or "googletagmanager.com" in url
                           for url in requests)

            download = page.locator(".article-audio a[download]")
            source = audio.locator("source").evaluate("source => source.src")
            assert download.evaluate("a => a.href") == source
            partial = context.request.get(source, headers={"Range": "bytes=0-1023"})
            # The local Pages runtime may return the full file for a Range request.
            assert partial.status in (200, 206)
            assert partial.headers["content-type"].startswith("audio/mpeg")
            if partial.status == 206:
                assert partial.headers["content-range"].startswith("bytes 0-1023/")
                assert len(partial.body()) == 1024
            else:
                assert len(partial.body()) > 1_000_000

            # Verify seeking before play when byte ranges are available.
            audio.evaluate("a => { a.muted = true; }")
            duration = audio.evaluate("a => a.duration")
            assert 680 < duration < 730, "Wrong audio asset: expected the revised narration"
            if partial.status == 206:
                audio.evaluate("a => a.currentTime = 350")
                page.wait_for_function("!document.querySelector('audio').seeking")
                assert abs(audio.evaluate("a => a.currentTime") - 350) < 1
            page.wait_for_function("document.querySelector('audio').readyState >= 2")
            audio.evaluate("a => a.play()")
            page.wait_for_function("document.querySelector('audio').currentTime > 0.1")
            audio.evaluate("a => a.pause()")
            if partial.status == 206:
                audio.evaluate("a => a.currentTime = a.duration / 2")
                page.wait_for_function("!document.querySelector('audio').seeking")
                assert abs(audio.evaluate("a => a.currentTime") - duration / 2) < 1
                print(f"PASS: seeking at viewport width {width}")
            else:
                print("NOTE: seeking requires a byte-range server; local Pages returned the full file")
            assert audio.evaluate("a => a.paused && a.error === null")
            context.close()
        browser.close()


if __name__ == "__main__":
    test_article_audio()
    print("PASS: article audio placement, duration before play, no autoplay, download and playback on desktop/mobile")
