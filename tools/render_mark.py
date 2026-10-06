#!/usr/bin/env python3
"""Render the brand mark to the PNG favicon.

Browsers that take SVG favicons use assets/brand/jarvis-mark.svg directly;
the others fall back to the 192 px PNG this writes next to it. Needs
Playwright with Chromium (pip install playwright; playwright install chromium).

    python3 tools/render_mark.py
"""

from pathlib import Path

from playwright.sync_api import sync_playwright

BRAND = Path(__file__).resolve().parent.parent / "assets" / "brand"
SIZE = 192


def main() -> None:
    svg = (BRAND / "jarvis-mark.svg").read_text()
    sized = svg.replace("<svg ", f'<svg width="{SIZE}" height="{SIZE}" ', 1)
    out = BRAND / f"jarvis-mark-{SIZE}.png"
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": SIZE, "height": SIZE})
        page.set_content(f"<!doctype html><body style='margin:0'>{sized}</body>")
        page.screenshot(path=str(out), omit_background=True)
        browser.close()
    print(out)


if __name__ == "__main__":
    main()
