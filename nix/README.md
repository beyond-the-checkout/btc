# Nix Configuration

This directory contains custom Nix configurations for the development environment.

## Directory Structure

- `pkgs/` - Custom package derivations for tools not in nixpkgs

## Quick Start

After adding a new custom package:

1. Add the derivation file to `nix/pkgs/your-tool.nix`
2. Export it in `nix/pkgs/default.nix`
3. Add `customPkgs.your-tool` to the packages list in `devenv.nix`
4. Run `devenv update` or reload your devenv

See `pkgs/README.md` for detailed instructions.
