{ pkgs, lib, config, inputs, ... }:


let
  pkgs-unstable = import inputs.nixpkgs-unstable {
    system = pkgs.stdenv.system;
    config.allowUnfree = true;
  };

  # Pin codex to version 0.55.0
  pkgs-codex = import inputs.nixpkgs-codex {
    system = pkgs.stdenv.system;
    config.allowUnfree = true;
  };

  # Pin pnpm to version 9.15.9
  pkgs-pnpm = import inputs.nixpkgs-pnpm {
    system = pkgs.stdenv.system;
    config.allowUnfree = true;
  };

  # Import custom packages with unfree allowed
  customPkgs = import ./nix/pkgs {
    pkgs = pkgs.extend (final: prev: {
      config = (prev.config or {}) // { allowUnfree = true; };
    });
  };
in
{
  # https://devenv.sh/basics/
  env.GREET = "devenv";


  # https://devenv.sh/packages/
  packages = [
  pkgs.git
  pkgs.gh
  pkgs.curl
  pkgs.caddy
  pkgs.jwt-cli
  pkgs.nodejs_20
  pkgs-unstable.claude-code
  pkgs-codex.codex
  pkgs.mysql84
  pkgs.nodePackages.typescript
  pkgs.nodePackages.ts-node
  pkgs.nodePackages.yarn
  pkgs.opentofu
  pkgs-pnpm.pnpm_9
  pkgs.pscale
  pkgs.tenv
  pkgs.zsh
  pkgs.snyk
  pkgs.bashInteractive
  pkgs.railway
  pkgs.stripe-cli
  pkgs.starship
  pkgs.uv

  # Custom packages
  # customPkgs.tinybird  # TODO: Package not found on PyPI with version 3.0.0b50
  customPkgs.amp  # ✓ Working - npm package
# customPkgs.droid  # ✓ Working - binary download
  customPkgs.beads  # Beads (bd) CLI - memory system for coding agents
  customPkgs.linearis  # Linearis CLI - Linear.app with JSON output for LLM agents
  ];
  # graphql-scalars
  # type-graphql
  # reflect-metadata
  # core-js
  # typegraphql-prisma
  # graphql-fields
  # tslib

  env.SHELL = "${pkgs.zsh}/bin/zsh";


  # https://devenv.sh/languages/
  languages.opentofu.enable = true;
  languages.javascript.enable = true;
  languages.typescript.enable = true;

  # https://devenv.sh/processes/
  # processes.cargo-watch.exec = "cargo-watch";

  # https://devenv.sh/services/
#   services.postgres = {
#     enable = true;
#     package = pkgs.postgresql_15;
#     initialDatabases = [{ name = dbName;}];
#     listen_addresses = "127.0.0.1";
#     initialScript = ''
#       CREATE DATABASE ${dbName};
#       GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};
#     '';
#   };

  # https://devenv.sh/scripts/
  scripts.hello.exec = ''
    echo hello from $GREET
  '';

  enterShell = ''
    hello
    git --version
    node --version
    tsc --version
    yarn --version
    tenv --version

    # Custom CLI tools installed via Nix
    echo "Custom tools:"
    echo "  amp: $(amp --version 2>/dev/null || echo 'not available')"
    echo "  droid: $(droid --version 2>/dev/null || echo 'not available')"
    echo "  bd: $(bd --version 2>/dev/null || echo 'not available')"
    echo "  linearis: $(linearis --version 2>/dev/null || echo 'not available')"
    # echo "  tb: $(tb --version 2>/dev/null || echo 'not available')"

    # Set DEVENV_PROFILE for Starship
    export DEVENV_PROFILE="btc"

    # Start Zsh
    export SHELL=${pkgs.zsh}/bin/zsh
    exec zsh
  '';

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
  '';
  dotenv.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
  # env.DATABASE_URL = "postgresql://myuser:mypassword@localhost:5432/prisma";
}
