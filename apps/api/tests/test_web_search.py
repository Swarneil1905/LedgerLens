"""Tests for web search URL allowlisting."""

from data_sources.web_search import _is_safe_url


def test_https_public_host_ok():
    assert _is_safe_url("https://www.example.com/path?q=1") is True


def test_http_rejected():
    assert _is_safe_url("http://example.com/") is False


def test_localhost_rejected():
    assert _is_safe_url("https://localhost/foo") is False


def test_metadata_host_rejected():
    assert _is_safe_url("https://metadata.google.internal/") is False


def test_userinfo_in_netloc_rejected():
    assert _is_safe_url("https://user:pass@example.com/") is False


def test_too_long_rejected():
    assert _is_safe_url("https://example.com/" + "a" * 2100) is False
