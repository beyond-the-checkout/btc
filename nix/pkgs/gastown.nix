{ lib
, buildGoModule
, fetchFromGitHub
, git
}:

# Gas Town (gt) - Multi-agent coordination system for coding agents
# Normally installed via: go install github.com/steveyegge/gastown/cmd/gt@latest
# This is a cleaner Nix-native approach building from source
#
# To update to a new version:
# 1. Get the latest commit: git ls-remote https://github.com/steveyegge/gastown.git HEAD
# 2. Update the 'rev' field below with the new commit hash
# 3. Set hash = lib.fakeHash; and vendorHash = lib.fakeHash;
# 4. Run: devenv shell (it will fail with the correct hashes)
# 5. Replace the fakeHash values with the correct hashes from the error
# 6. Run: devenv shell (should succeed now)

buildGoModule rec {
  pname = "gt";
  version = "0.0.1-unstable-2025-01-01";

  src = fetchFromGitHub {
    owner = "steveyegge";
    repo = "gastown";
    rev = "a06c72028a2fcb3b48ce6c164be17730e2cbb052";
    hash = "sha256-fJr67osZltz4C3Ov7LYMTaFYTqCdJkkUwGpkArQ0D9Y=";
  };

  # Use proxyVendor to fetch dependencies via Go proxy
  proxyVendor = true;
  vendorHash = "sha256-/x66IjaJSNbjiAGJk3zXFvsReq4R+XEb0VwWGRRooiY=";

  # Add git to build environment
  nativeBuildInputs = [ git ];

  subPackages = [ "cmd/gt" ];

  ldflags = [
    "-s"
    "-w"
    "-X main.version=${version}"
  ];

  meta = with lib; {
    description = "Gas Town - Multi-agent coordination system for coding agents";
    homepage = "https://github.com/steveyegge/gastown";
    license = licenses.asl20;
    maintainers = [ ];
    platforms = platforms.unix;
    mainProgram = "gt";
  };
}
