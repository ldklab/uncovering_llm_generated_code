#!/bin/bash
#SBATCH --job-name=gpt_16t
#SBATCH --output=%x_%j.out 
#SBATCH --time=8:00:00               

# ---------------------------------------------------------------------
echo "Starting run at: `date`"
# ---------------------------------------------------------------------

export GOOGLE_API_KEY=AIzaSyC-ZBQjc7nnUxtC5R20SPQbFqy5WPUEKek
export OPENAI_API_KEY=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

source $HOME/projects/def-tan1/sinpo/repos/uncovering_llm_generated_code/.venv/bin/activate

python code_rewriting.py --model gemini-1.5-flash --rewriting_number 8
# python code_rewriting.py --model gpt-4o-mini --rewriting_number 4

# ---------------------------------------------------------------------
echo "Job finished with exit code $? at: `date`"
# ---------------------------------------------------------------------


# squeue -j 37408858, 37408866

