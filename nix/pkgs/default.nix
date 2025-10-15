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
}
