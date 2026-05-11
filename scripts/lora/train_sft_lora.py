#!/usr/bin/env python3
"""
Supervised fine-tuning with LoRA (optional QLoRA). Run on a GPU host — not on the LedgerLens API image.

  pip install -r scripts/lora/requirements-train.txt
  python scripts/lora/train_sft_lora.py --base_model meta-llama/Llama-3.2-3B-Instruct \\
      --dataset scripts/lora/example_dataset.jsonl --output_dir outputs/lora-demo --qlora

Merge → GGUF → `ollama create` is documented in scripts/lora/README.md.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def main() -> None:
    try:
        import torch
        from datasets import load_dataset
        from peft import LoraConfig, prepare_model_for_kbit_training
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from trl import SFTConfig, SFTTrainer
    except ImportError as exc:
        print(
            "Missing dependency. Create a GPU venv and run:\n"
            "  pip install -r scripts/lora/requirements-train.txt\n",
            file=sys.stderr,
        )
        raise SystemExit(1) from exc

    parser = argparse.ArgumentParser(description="LoRA / QLoRA SFT for LedgerLens-style chat JSONL")
    parser.add_argument("--base_model", required=True, help="HF model id or local path")
    parser.add_argument("--dataset", required=True, type=Path, help="JSONL with `messages` per line")
    parser.add_argument("--output_dir", required=True, type=Path, help="Adapter output directory")
    parser.add_argument("--epochs", type=float, default=1.0)
    parser.add_argument("--max_seq_length", type=int, default=4096)
    parser.add_argument("--qlora", action="store_true", help="4-bit load (needs CUDA bitsandbytes)")
    args = parser.parse_args()

    if not args.dataset.is_file():
        raise SystemExit(f"Dataset not found: {args.dataset}")

    args.output_dir.mkdir(parents=True, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    if args.qlora:
        bnb = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16,
        )
        model = AutoModelForCausalLM.from_pretrained(
            args.base_model,
            quantization_config=bnb,
            device_map="auto",
            trust_remote_code=True,
        )
        model = prepare_model_for_kbit_training(model)
    else:
        dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
        model = AutoModelForCausalLM.from_pretrained(
            args.base_model,
            torch_dtype=dtype,
            device_map="auto" if torch.cuda.is_available() else None,
            trust_remote_code=True,
        )

    peft = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    )

    dataset = load_dataset("json", data_files=str(args.dataset), split="train")

    def formatting_func(example: dict) -> str:
        msgs = example.get("messages")
        if not isinstance(msgs, list):
            return ""
        return tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=False)

    use_bf16 = bool(torch.cuda.is_available() and torch.cuda.is_bf16_supported())
    sft_args = SFTConfig(
        output_dir=str(args.output_dir),
        num_train_epochs=args.epochs,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        warmup_ratio=0.03,
        logging_steps=5,
        save_strategy="epoch",
        bf16=use_bf16,
        fp16=not use_bf16 and torch.cuda.is_available(),
        gradient_checkpointing=True,
        max_length=args.max_seq_length,
        assistant_only_loss=True,
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        args=sft_args,
        train_dataset=dataset,
        processing_class=tokenizer,
        formatting_func=formatting_func,
        peft_config=peft,
    )
    trainer.train()
    trainer.save_model(str(args.output_dir))
    tokenizer.save_pretrained(str(args.output_dir))
    print(f"Saved adapter + tokenizer to {args.output_dir.resolve()}")


if __name__ == "__main__":
    main()
