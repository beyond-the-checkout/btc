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
  version = "0.22.0";

  src = fetchFromGitHub {
    owner = "steveyegge";
    repo = "beads";
    rev = "v${version}";
# hash = lib.fakeHash; # use when upgrading
    hash = "sha256-n/nv7FoCvJQiGN3ibQgxNWYOLMLwzzGxdwm5cJW+uwI=";
  };

  # Use proxyVendor because the vendor directory in the repo is out of sync
  proxyVendor = true;
# vendorHash = lib.fakeHash; # use when upgrading
  vendorHash = "sha256-yQcMHDClZRfq1kpboKTyRWi+8UfD4P899ObcoUNvXCk=";

  # Add git to build environment for tests
  nativeBuildInputs = [ git ];

  # Some tests require the bd binary to be in PATH during test execution
  # Skip TestScripts (requires bd binary), TestGitPullSyncIntegration (network),
  # and TestMigrateHashIDs (fails in sandbox)
  checkFlags = [
    "-skip=TestGitPullSyncIntegration|TestScripts|TestMigrateHashIDs"
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
