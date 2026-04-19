from pydantic import BaseModel


class ChartPointResponse(BaseModel):
    label: str
    value: float


class ChartSeriesResponse(BaseModel):
    id: str
    label: str
    color: str
    points: list[ChartPointResponse]


class ChartResponse(BaseModel):
    id: str
    title: str
    subtitle: str
    series: list[ChartSeriesResponse]
