{ pkgs }:

{
  # Custom packages that aren't in nixpkgs or need custom derivations

  # TinyBird CLI - Analytics backend tool
  # Normally installed via: curl https://tinybird.co | sh
  tinybird = pkgs.callPackage ./tinybird.nix { };

  # Amp CLI - AI-powered code editor
  # Normally installed via: curl -fsSL https://ampcode.com/install.sh | bash
  amp = pkgs.callPackage ./amp.nix { };

  # Droid (Factory AI CLI) - AI-powered development tool
  # Normally installed via: curl -fsSL https://app.factory.ai/cli | sh
  droid = pkgs.callPackage ./droid.nix { };

  # Beads (bd) - Lightweight memory system for coding agents
  # Normally installed via: curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/install.sh | bash
  beads = pkgs.callPackage ./beads.nix { };

  # Linearis - CLI tool for Linear.app with JSON output
  # Normally installed via: npm install -g --install-links czottmann/linearis
  linearis = pkgs.callPackage ./linearis.nix { };

  # Claude Code - AI-powered coding assistant from Anthropic
  # Normally installed via: npm install -g @anthropic-ai/claude-code
  claude-code = pkgs.callPackage ./claude-code.nix { };

  # OpenAI Codex CLI - AI-powered coding assistant
  # Normally installed via: npm install -g @openai/codex
  codex = pkgs.callPackage ./codex.nix { };
}
