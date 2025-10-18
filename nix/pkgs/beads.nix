{ lib
, buildGoModule
, fetchFromGitHub
}:

# Beads CLI (bd) - Lightweight memory system for coding agents
# Normally installed via: curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/install.sh | bash
# or: brew tap steveyegge/beads && brew install bd
# This is a cleaner Nix-native approach building from source

buildGoModule rec {
  pname = "bd";
  version = "0.9.6";

  src = fetchFromGitHub {
    owner = "steveyegge";
    repo = "beads";
    rev = "v${version}";
    hash = "sha256-QpEezKjhQHjfgBRfHrSSlmqjoeLPWjtfHDOMPEt55fs=";
  };

  # Use proxyVendor because the vendor directory in the repo is out of sync
  proxyVendor = true;
  vendorHash = "sha256-dQLzUjt0CBGzTfwjWIWI4KQ34NV8KJGK4s9oPgeTO2s=";

  subPackages = [ "cmd/bd" ];

  ldflags = [
    "-s"
    "-w"
    "-X main.version=${version}"
  ];

  meta = with lib; {
    description = "Beads - Lightweight memory system for coding agents";
    homepage = "https://github.com/steveyegge/beads";
    license = licenses.asl20;
    maintainers = [ ];
    platforms = platforms.unix;
    mainProgram = "bd";
  };
}
