from data_sources.normalizer import gather_company_sources


async def main() -> None:
    sources = await gather_company_sources("AAPL")
    print({"ticker": "AAPL", "source_count": len(sources)})


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
