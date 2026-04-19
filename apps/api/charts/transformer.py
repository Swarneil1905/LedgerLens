from memory.persistence import _chart
from schemas.chart import ChartResponse


def get_company_charts(_: str) -> list[ChartResponse]:
    return [_chart]
