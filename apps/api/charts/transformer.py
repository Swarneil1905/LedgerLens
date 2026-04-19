from memory.persistence import list_workspace_charts
from schemas.chart import ChartResponse


def get_company_charts(ticker: str) -> list[ChartResponse]:
    return list_workspace_charts(ticker)
