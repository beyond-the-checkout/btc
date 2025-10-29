{ lib
, buildGoModule
, fetchFromGitHub
, git
}:

# Beads CLI (bd) - Lightweight memory system for coding agents
# Normally installed via: curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/install.sh | bash
# or: brew tap steveyegge/beads && brew install bd
# This is a cleaner Nix-native approach building from source

buildGoModule rec {
  pname = "bd";
  version = "0.17.7";

  src = fetchFromGitHub {
    owner = "steveyegge";
    repo = "beads";
    rev = "v${version}";
# hash = lib.fakeHash; # use when upgrading
    hash = "sha256-eX1dmJmQKdSwvWGJBA1S0cOi5p9cR2Z9d+DQhysAryk=";
  };

  # Use proxyVendor because the vendor directory in the repo is out of sync
  proxyVendor = true;
  vendorHash = "sha256-kmyg/ZCndqsDPKsg64jWx9T1r8Oymdg8gQX8Fvyl/3E=";

  # Add git to build environment for tests
  nativeBuildInputs = [ git ];

  # Some tests still fail due to sandbox restrictions, skip those
  checkFlags = [
    "-skip=TestGitPullSyncIntegration"
  ];

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
