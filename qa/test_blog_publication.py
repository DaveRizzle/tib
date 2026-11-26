"""Check the article URL migration against an assembled Cloudflare Pages preview."""
import os
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, build_opener, urlopen


BASE = os.environ.get("TIB_PREVIEW_URL", "http://127.0.0.1:8788").rstrip("/")
PATH = "/blog/plan-your-strength-training-week/"
CANONICAL = "https://www.theinfinitebody.com" + PATH
OLD_PATH = "/blog/annual-strength-training-calendar"


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.elements = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

    def attrs(self, tag, key, value):
        return [attrs for element, attrs in self.elements
                if element == tag and attrs.get(key) == value]


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def check_publication():
    opener = build_opener(NoRedirect)
    for suffix in ["", "/", "/index.html"]:
        for query in ["", "?utm_source=migration-check"]:
            try:
                opener.open(BASE + OLD_PATH + suffix + query, timeout=15)
            except HTTPError as response:
                assert response.code == 301, response.code
                assert urljoin(BASE, response.headers["Location"]) == BASE + PATH + query
            else:
                raise AssertionError("Old article URL did not permanently redirect")

    with opener.open(BASE + PATH, timeout=15) as response:
        assert response.status == 200
        html = response.read().decode()
    page = Page(html)
    assert [a["href"] for a in page.attrs("link", "rel", "canonical")] == [CANONICAL]
    assert len(page.attrs("h1", "id", "articleTitle")) == 1
    assert OLD_PATH not in html
    assert page.attrs("a", "href", "/#about")
    assert page.attrs("a", "href", "/#how")
    assert page.attrs("a", "href", "/#faq")
    assert page.attrs("a", "href", "https://calendar.app.google/ZyW4qWin1iDgaxhX6")
    assert "Online Strength Coach" in html

    blog = urlopen(BASE + "/blog/", timeout=15).read().decode()
    assert Page(blog).attrs("a", "href", PATH)
    assert OLD_PATH not in blog
    sitemap = ET.fromstring(urlopen(BASE + "/sitemap.xml", timeout=15).read())
    urls = [node.text for node in sitemap.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    assert CANONICAL in urls
    assert not any(OLD_PATH in url for url in urls)
    for url in urls:
        assert opener.open(BASE + urlsplit(url).path, timeout=15).status == 200


if __name__ == "__main__":
    check_publication()
    print("PASS: article permanent redirects, canonical, internal links and sitemap")
