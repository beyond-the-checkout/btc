{ lib
, stdenv
, fetchurl
, nodejs
, makeWrapper
}:

# Claude Code CLI - AI coding assistant
# Normally installed via: npm install -g @anthropic-ai/claude-code
# or: curl -fsSL https://claude.ai/install.sh | bash
# This is a cleaner Nix-native approach using the npm package
#
# Note: Claude Code is distributed as a single pre-built executable (cli.js)
# along with vendor files for ripgrep and JetBrains plugin.
#
# To update to a new version:
# 1. Check latest version at: https://www.npmjs.com/package/@anthropic-ai/claude-code
# 2. Update the 'version' field below
# 3. Get the new hash by running:
#    nix-prefetch-url --type sha256 --unpack "https://registry.npmjs.org/@anthropic-ai/claude-code/-/claude-code-NEW_VERSION.tgz"
# 4. Convert the hash to SRI format:
#    nix hash convert --to-sri sha256:HASH_FROM_STEP_3
# 5. Update the 'hash' field below with the SRI hash (sha256-...)
# 6. Run: devenv update && devenv shell
#
# One-liner for steps 3-4:
#   nix hash convert --to-sri $(nix-prefetch-url --type sha256 --unpack "https://registry.npmjs.org/@anthropic-ai/claude-code/-/claude-code-NEW_VERSION.tgz")

stdenv.mkDerivation rec {
  pname = "claude-code";
  version = "2.0.76";

  src = fetchurl {
    url = "https://registry.npmjs.org/@anthropic-ai/claude-code/-/claude-code-${version}.tgz";
    hash = "sha256-46IqiGJZrZM4vVcanZj/vY4uxFH3/4LxNA+Qb6iIHDk=";
  };

  nativeBuildInputs = [ makeWrapper ];
  buildInputs = [ nodejs ];

  unpackPhase = ''
    tar xzf $src
  '';

  installPhase = ''
    mkdir -p $out/lib/claude-code
    cp -r package/* $out/lib/claude-code/

    # Make cli.js executable
    chmod +x $out/lib/claude-code/cli.js

    # Create wrapper that runs cli.js with node
    mkdir -p $out/bin
    makeWrapper ${nodejs}/bin/node $out/bin/claude \
      --add-flags "$out/lib/claude-code/cli.js"
  '';

  meta = with lib; {
    description = "Claude Code - AI-powered coding assistant from Anthropic";
    homepage = "https://claude.ai/code";
    license = licenses.unfree;
    maintainers = [ ];
    platforms = platforms.unix;
    mainProgram = "claude";
  };
}
