#!/usr/bin/env python3
"""
TypeScript linting and type-checking hook for Claude Code.
Runs automatically after Edit/Write operations on .ts/.tsx files.
"""
from __future__ import annotations

import json
import sys
import subprocess
import os
from pathlib import Path


def is_typescript_file(file_path: str) -> bool:
    """Check if the file is a TypeScript file."""
    return file_path.endswith(('.ts', '.tsx'))


def run_command(cmd: list[str], cwd: str) -> tuple[int, str, str]:
    """Run a command and return exit code, stdout, stderr."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 1, "", "Command timed out after 30 seconds"
    except Exception as e:
        return 1, "", f"Error running command: {e}"


def check_typescript(file_path: str, project_dir: str) -> tuple[bool, list[str]]:
    """
    Run TypeScript checks on a file.
    Returns (success, issues).
    """
    issues = []
    file_abs = os.path.abspath(file_path)

    # Determine if this is in apps/web or another package
    # Use tsc from the appropriate location
    rel_path = os.path.relpath(file_abs, project_dir)

    # Check if file is in apps/web
    if rel_path.startswith('apps/web/'):
        working_dir = os.path.join(project_dir, 'apps/web')
    else:
        # Try to find the nearest package.json
        current = Path(file_abs).parent
        while current != Path(project_dir):
            if (current / 'package.json').exists():
                working_dir = str(current)
                break
            current = current.parent
        else:
            working_dir = project_dir

    # Run ESLint check (non-blocking, just report issues)
    # Only check if .eslintrc or eslint config exists
    eslint_config = Path(working_dir) / '.eslintrc.json'
    if eslint_config.exists() or (Path(working_dir) / 'eslint.config.js').exists():
        exit_code, stdout, stderr = run_command(
            ['pnpm', 'eslint', '--quiet', file_abs],
            working_dir
        )
        if exit_code != 0 and stdout.strip():
            issues.append(f"ESLint issues:\n{stdout}")

    # Run TypeScript type check
    # Use tsc --noEmit to just check types without building
    exit_code, stdout, stderr = run_command(
        ['pnpm', 'tsc', '--noEmit', '--pretty', 'false'],
        working_dir
    )

    if exit_code != 0:
        # Parse tsc output to only show errors related to our file
        lines = (stderr + stdout).split('\n')
        file_errors = []
        for line in lines:
            if file_abs in line or rel_path in line or os.path.basename(file_abs) in line:
                file_errors.append(line)

        if file_errors:
            issues.append(f"TypeScript errors:\n" + '\n'.join(file_errors))

    return len(issues) == 0, issues


def main():
    try:
        # Read hook input from stdin
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    # Extract data
    tool_name = input_data.get('tool_name', '')
    tool_input = input_data.get('tool_input', {})
    file_path = tool_input.get('file_path', '')
    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())

    # Skip if not TypeScript file
    if not is_typescript_file(file_path):
        sys.exit(0)

    # Skip if file doesn't exist
    if not os.path.exists(file_path):
        sys.exit(0)

    print(f"Checking TypeScript file: {os.path.relpath(file_path, project_dir)}")

    # Run TypeScript checks
    success, issues = check_typescript(file_path, project_dir)

    if not success:
        # Return blocking error with feedback to Claude
        output = {
            "decision": "block",
            "reason": "TypeScript validation failed. Please fix the following issues:\n\n" +
                     "\n\n".join(issues),
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": f"The file {os.path.relpath(file_path, project_dir)} has type errors or linting issues that need to be fixed."
            }
        }
        print(json.dumps(output, indent=2))
        sys.exit(0)

    print("✓ TypeScript validation passed")

    # Return success with suppressed output (don't clutter transcript)
    output = {
        "suppressOutput": True
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == '__main__':
    main()
