import string
import sys
from typing import Any, Callable, Iterable, Mapping, Sequence, Text
from typing_extensions import SupportsIndex

from markupsafe._compat import text_type
from markupsafe._native import escape as escape, escape_silent as escape_silent, soft_unicode as soft_unicode

class Markup(text_type):
    def __new__(cls, base: Text = ..., encoding: Text | None = ..., errors: Text = ...) -> Markup: ...
    def __html__(self) -> Markup: ...
    def __add__(self, other: text_type) -> Markup: ...
    def __radd__(self, other: text_type) -> Markup: ...
    def __mul__(self, num: int) -> Markup: ...  # type: ignore
    def __rmul__(self, num: int) -> Markup: ...  # type: ignore
    def __mod__(self, *args: Any) -> Markup: ...
    def join(self, seq: Iterable[text_type]) -> Markup: ...
    def split(self, sep: text_type | None = ..., maxsplit: SupportsIndex = ...) -> list[Markup]: ...  # type: ignore
    def rsplit(self, sep: text_type | None = ..., maxsplit: SupportsIndex = ...) -> list[Markup]: ...  # type: ignore
    def splitlines(self, keepends: bool = ...) -> list[Markup]: ...  # type: ignore
    def unescape(self) -> Text: ...
    def striptags(self) -> Text: ...
    @classmethod
    def escape(cls, s: text_type) -> Markup: ...  # noqa: F811
    def partition(self, sep: text_type) -> tuple[Markup, Markup, Markup]: ...
    def rpartition(self, sep: text_type) -> tuple[Markup, Markup, Markup]: ...
    def format(self, *args: Any, **kwargs: Any) -> Markup: ...
    def __html_format__(self, format_spec: text_type) -> Markup: ...
    def __getslice__(self, start: int, stop: int) -> Markup: ...
    def __getitem__(self, i: int | slice) -> Markup: ...
    def capitalize(self) -> Markup: ...
    def title(self) -> Markup: ...
    def lower(self) -> Markup: ...
    def upper(self) -> Markup: ...
    def swapcase(self) -> Markup: ...
    def replace(self, old: text_type, new: text_type, count: SupportsIndex = ...) -> Markup: ...
    def ljust(self, width: SupportsIndex, fillchar: text_type = ...) -> Markup: ...
    def rjust(self, width: SupportsIndex, fillchar: text_type = ...) -> Markup: ...
    def lstrip(self, chars: text_type | None = ...) -> Markup: ...
    def rstrip(self, chars: text_type | None = ...) -> Markup: ...
    def strip(self, chars: text_type | None = ...) -> Markup: ...
    def center(self, width: SupportsIndex, fillchar: text_type = ...) -> Markup: ...
    def zfill(self, width: SupportsIndex) -> Markup: ...
    def translate(self, table: Mapping[int, int | text_type | None] | Sequence[int | text_type | None]) -> Markup: ...
    if sys.version_info >= (3, 8):
        def expandtabs(self, tabsize: SupportsIndex = ...) -> Markup: ...
    else:
        def expandtabs(self, tabsize: int = ...) -> Markup: ...

class EscapeFormatter(string.Formatter):
    escape: Callable[[text_type], Markup]
    def __init__(self, escape: Callable[[text_type], Markup]) -> None: ...  # noqa: F811
    def format_field(self, value: text_type, format_spec: text_type) -> Markup: ...

if sys.version_info >= (3,):
    soft_str = soft_unicode
