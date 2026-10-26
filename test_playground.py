import re

import pytest
from playwright.sync_api import Page, Route, expect

BASE_URL = "https://katalinux.github.io/test-pw-playground/"


@pytest.fixture(autouse=True)
def open_playground(page: Page):
    # Pre-accept cookies so the banner never covers the page.
    page.add_init_script("localStorage.setItem('cookiesAccepted', 'true')")
    page.goto(BASE_URL)


def test_has_title(page: Page):
    expect(page).to_have_title("Playwright Playground")
    expect(page.get_by_role("heading", level=1)).to_have_text("Playwright Playground")


def test_form_shows_validation_errors(page: Page):
    page.get_by_test_id("submit-form").click()

    expect(page.get_by_test_id("error-name")).to_have_text("Name must be at least 2 characters.")
    expect(page.get_by_test_id("error-email")).to_have_text("Enter a valid email address.")
    expect(page.get_by_test_id("error-password")).to_have_text("Password must be at least 6 characters.")
    expect(page.get_by_test_id("error-terms")).to_have_text("You must accept the terms.")
    expect(page.get_by_test_id("form-success")).to_be_hidden()


def test_form_submits_successfully(page: Page):
    form = page.get_by_test_id("demo-form")
    
    full_name =  form.get_by_label("Full name")
    full_name.fill("Ada Lovelace")
    expect(full_name).to_have_value("Ada Lovelace")
    
    form.get_by_label("Email").fill("ada@example.com")
    expect(form.get_by_label("Email")).to_have_value("ada@example.com")

    form.get_by_label("Age").fill("36")
    form.get_by_label("Birth date").fill("1815-12-10")
    form.get_by_label("Password", exact=True).fill("secret123")
    form.get_by_label("Country").select_option("ro")
    form.get_by_test_id("radio-plan-pro").check()
    form.get_by_label("I accept the terms").check()
    form.get_by_label("Bio").fill("First programmer.")
   
    page.get_by_test_id("submit-form").click()

    expect(page.get_by_test_id("form-success")).to_be_visible()
    # The form resets after a successful submit.
    expect(form.get_by_label("Full name")).to_be_empty()


def test_file_upload_shows_file_name(page: Page):
    page.get_by_test_id("input-file").set_input_files(
        {"name": "avatar.png", "mimeType": "image/png", "buffer": b"fake-png"}
    )
    expect(page.get_by_test_id("file-name")).to_have_text("avatar.png")


def test_modal_opens_and_closes(page: Page):
    modal = page.get_by_test_id("demo-modal")
    page.get_by_test_id("open-modal").click()
    expect(modal).to_be_visible()
    page.get_by_test_id("close-modal").click()
    expect(modal).to_be_hidden()


def test_tabs_switch_panels(page: Page):
    page.get_by_role("tab", name="Tab Two").click()
    expect(page.get_by_test_id("tab-panel-2")).to_be_visible()
    expect(page.get_by_test_id("tab-panel-1")).to_be_hidden()
    expect(page.get_by_test_id("tab-btn-2")).to_have_class(re.compile(r"\bactive\b"))


def test_accordion_with_xpath(page: Page):
    # Find the header by its text, then reach its body through a sibling axis.
    header = page.locator("xpath=//div[@data-testid='accordion']//button[normalize-space()='Section 1']")
    body = header.locator("xpath=following-sibling::div[contains(@class, 'accordion-body')]")

    expect(body).to_be_hidden()
    header.click()
    expect(body).to_have_text("Details for section 1.")
    header.click()
    expect(body).to_be_hidden()



def test_slider_updates_value(page: Page):
    page.get_by_test_id("slider-volume").fill("80")
    expect(page.get_by_test_id("slider-value")).to_have_text("80")


@pytest.mark.parametrize(
    "header, expected_first",
    [("th-name", "Alice"), ("th-score", "Dan")],
)
def test_table_sorts_ascending(page: Page, header: str, expected_first: str):
    page.get_by_test_id(header).click()
    first_row = page.get_by_test_id("table-body").get_by_role("row").first
    expect(first_row).to_contain_text(expected_first)


def test_table_pagination(page: Page):
    indicator = page.get_by_test_id("page-indicator")
    expect(indicator).to_have_text("Page 1 of 3")
    page.get_by_test_id("next-page").click()
    expect(indicator).to_have_text("Page 2 of 3")
    expect(page.get_by_test_id("table-body").get_by_role("row")).to_have_count(3)


def test_delayed_content_appears(page: Page):
    page.get_by_test_id("load-delayed").click()
    expect(page.get_by_test_id("spinner")).to_be_visible()
    # Auto-waiting handles the 1.5s delay.
    expect(page.get_by_test_id("delayed-content")).to_be_visible()
    expect(page.get_by_test_id("spinner")).to_be_hidden()


def test_load_more_adds_items(page: Page):
    items = page.get_by_test_id("load-more-list").get_by_role("listitem")
    expect(items).to_have_count(3)
    page.get_by_test_id("load-more-btn").click()
    expect(items).to_have_count(6)
    expect(items.last).to_have_text("List item 6")


def test_iframe_content(page: Page):
    frame = page.frame_locator("[data-testid='embedded-frame']")
    expect(frame.locator("body")).not_to_be_empty()


def test_login_and_logout(page: Page):
    page.get_by_test_id("login-username").fill("katalin")
    page.get_by_test_id("login-password").fill("pw")
    page.get_by_test_id("login-submit").click()

    expect(page.get_by_test_id("welcome-name")).to_have_text("katalin")
    expect(page.get_by_test_id("session-status")).to_have_text("Logged in as katalin")

    # Session survives a reload (stored in localStorage).
    page.reload()
    expect(page.get_by_test_id("logged-in-block")).to_be_visible()

    page.get_by_test_id("logout-btn").click()
    expect(page.get_by_test_id("session-status")).to_have_text("Logged out")


def test_login_requires_both_fields(page: Page):
    page.get_by_test_id("login-username").fill("katalin")
    page.get_by_test_id("login-submit").click()

    # The inputs are `required`, so native browser validation blocks the submit
    # before the app's own "Please enter both fields." message can show.
    password = page.get_by_test_id("login-password")
    assert password.evaluate("el => el.validity.valueMissing")
    expect(page.get_by_test_id("session-status")).to_have_text("Logged out")


def test_api_posts_mocked(page: Page):
    def handle(route: Route):
        route.fulfill(json=[{"id": 1, "title": "Mocked post"}, {"id": 2, "title": "Another one"}])

    page.route("**/jsonplaceholder.typicode.com/posts*", handle)
    page.get_by_test_id("fetch-posts").click()

    results = page.get_by_test_id("api-results").get_by_role("listitem")
    expect(results).to_have_text(["Mocked post", "Another one"])


def test_api_error_state(page: Page):
    page.route("**/jsonplaceholder.typicode.com/posts*", lambda route: route.fulfill(status=500, json={"error": "Server error"}))
    page.get_by_test_id("fetch-posts").click()
    expect(page.get_by_test_id("api-error")).to_be_visible()


def test_tooltip_has_native_title(page: Page):
    trigger = page.get_by_test_id("tooltip-trigger")
    # It's a native `title` tooltip, so check the attribute rather than a rendered popup.
    expect(trigger).to_have_attribute("title", "I am a native tooltip")
    trigger.hover()
    expect(page.get_by_title("I am a native tooltip")).to_have_text("Hover me")
 
 
def test_dropdown_toggles_open_and_closed(page: Page):
    toggle = page.get_by_test_id("dropdown-toggle")
    menu = page.get_by_test_id("dropdown-menu")
 
    expect(menu).to_be_hidden()
    toggle.click()
    expect(menu).to_be_visible()
    expect(menu.get_by_role("listitem")).to_have_text(["Item 1", "Item 2", "Item 3"])
    toggle.click()
    expect(menu).to_be_hidden()
 
 
def test_dropdown_closes_on_outside_click(page: Page):
    menu = page.get_by_test_id("dropdown-menu")
    page.get_by_test_id("dropdown-toggle").click()
    expect(menu).to_be_visible()
 
    page.get_by_role("heading", level=1).click()
    expect(menu).to_be_hidden()
 
 
def test_dropdown_stays_open_when_item_clicked(page: Page):
    # Clicks inside .dropdown don't close it; only outside clicks do.
    menu = page.get_by_test_id("dropdown-menu")
    page.get_by_test_id("dropdown-toggle").click()
    page.get_by_test_id("dropdown-item-2").click()
    expect(menu).to_be_visible()
 

def test_drag_and_drop_reorders_list(page: Page):
    items = page.get_by_test_id("drag-list").get_by_role("listitem")
    expect(items).to_have_text(["Item A", "Item B", "Item C"])

    # The list reorders on dragover by cursor position, so drop on the lower half of the last item.
    page.get_by_test_id("drag-item-1").drag_to(
        page.get_by_test_id("drag-item-3"), target_position={"x": 20, "y": 30}
    )
    expect(items).to_have_text(["Item B", "Item C", "Item A"])


def test_drag_and_drop_moves_item_to_top(page: Page):
    items = page.get_by_test_id("drag-list").get_by_role("listitem")
    print('\nInitial items:', items.all_text_contents())

    assert len(items.all_text_contents()) == 3

    page.get_by_test_id("drag-item-3").drag_to(
        page.get_by_test_id("drag-item-1"), target_position={"x": 20, "y": 2}
    )
    print('Items after drag:', items.all_text_contents())
    expect(items).to_have_text(["Item C", "Item A", "Item B"])
