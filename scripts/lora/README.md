# LoRA / QLoRA starter for LedgerLens-style answers

Training happens **outside** the FastAPI app (GPU machine, Colab, or cloud notebook). Ollama only **runs** the exported model after you merge or convert weights.

## What you are training

- **Input:** chat rows with `messages` (system + user context + ideal assistant reply).
- **User message** should mirror production: same shape as `build_answer_prompt` in `apps/api/llm/prompts.py` — `Ticker: …`, `Question: …`, then **`Context (excerpts and source index only):`** and the numbered excerpts so the adapter learns **format and tone**, not facts from memory.
- **Output:** PEFT adapter weights under `--output_dir`. You then merge into the base model (optional) and convert to **GGUF** for Ollama (see Ollama + `llama.cpp` import docs for your base model family).

## 1) Build a dataset

Copy `example_dataset.jsonl` and add dozens to thousands of rows (more is usually better, up to quality limits). Each line is JSON with a `messages` array.

## 2) Install training deps (GPU)

```bash
python -m venv .venv-lora
.venv-lora\Scripts\activate   # Windows
# source .venv-lora/bin/activate  # Linux/macOS
pip install -r scripts/lora/requirements-train.txt
```

QLoRA needs a **CUDA** build of PyTorch + `bitsandbytes` (Linux is the path of least pain). On CPU-only machines, **omit `--qlora`** (still slow; mostly for sanity checks).

## Growing `example_dataset.jsonl`

Each **line** is one JSON object (JSONL). One training example = one object with a `messages` array of `{role, content}` ending with **`assistant`**.

1. **Lock the system prompt**  
   For real training, set every row’s `system` `content` to the **exact** `SYSTEM_PROMPT` string from `apps/api/llm/prompts.py` (strip the outer triple-quoted whitespace). That way the adapter sees the same instructions as production Ollama.

2. **Build the user turn like production**  
   After you run a query in LedgerLens (local or prod), reconstruct the model’s **user** message as:
   - `Ticker: <TICKER>`
   - `Question: <same question the user asked>`
   - blank line
   - `Context (excerpts and source index only):`
   - then paste the **same excerpt block** the API had for that turn (numbered `[1]`, `[2]`, … as in the app).  
   You can copy from logs if you add them, from a debug endpoint, or by hand from the Sources / indexed text you already trust.

3. **Write the “gold” assistant reply**  
   Either keep a good model answer and **edit** it, or write the answer from scratch. It must **only** use facts in the excerpts (same rules as the live system prompt). Save that string as the `assistant` `content`.

4. **Append one JSON line**  
   Serialize the full `messages` array to one line (no pretty-print). Example shape is in `example_dataset.jsonl`.

5. **Validate**  
   From repo root:
   ```bash
   python -c "import json, pathlib; p=pathlib.Path('scripts/lora/my_dataset.jsonl');
   [json.loads(l) for l in p.read_text(encoding='utf-8').splitlines() if l.strip()]"
   ```
   If that raises, fix the broken line.

6. **How much data?**  
   - **~20–50** rows: smoke-test that training runs.  
   - **~200–1k** rows: you may start seeing style/format shifts.  
   - **Thousands** of high-quality rows: stronger, but quality and diversity beat raw count.

7. **Diversify**  
   Mix tickers, question types (QoQ, liquidity, risks, “what’s missing”), and a few **honest “excerpts don’t say”** answers so the model does not learn to invent filings.

## 3) Run training

Gated models (e.g. Llama) need a [Hugging Face token](https://huggingface.co/docs/hub/security-tokens): `huggingface-cli login` or `HF_TOKEN` in the environment.

```bash
python scripts/lora/train_sft_lora.py ^
  --base_model meta-llama/Llama-3.2-3B-Instruct ^
  --dataset scripts/lora/example_dataset.jsonl ^
  --output_dir outputs/lora-exmp ^
  --qlora
```

Use a base model that matches what you will serve in Ollama (same family / instruct template). Replace flags with Linux ` \ ` line continuations if needed. If `SFTConfig` rejects `assistant_only_loss`, bump `trl` to match `scripts/lora/requirements-train.txt`.

## 4) Ship to Ollama

1. Merge adapter into full weights (Hugging Face `merge_and_unload` pattern) **or** export per your tooling.
2. Convert to **GGUF** with the converter appropriate to your architecture.
3. `ollama create` from a `Modelfile` pointing at the GGUF.
4. Set **`OLLAMA_MODEL`** in production to the new tag.

## 5) When *not* to use LoRA first

If answers are wrong on **facts**, improve **retrieval and excerpts** before scaling training data.
