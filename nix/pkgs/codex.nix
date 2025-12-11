{ lib
, stdenv
, fetchurl
, nodejs
, makeWrapper
}:

# OpenAI Codex CLI - AI coding assistant
# Normally installed via: npm install -g @openai/codex
# This is a cleaner Nix-native approach using the npm package
#
# To update to a new version:
# 1. Check latest version at: https://www.npmjs.com/package/@openai/codex
# 2. Update the 'version' field below
# 3. Get the new hash by running:
#    nix-prefetch-url --type sha256 --unpack "https://registry.npmjs.org/@openai/codex/-/codex-NEW_VERSION.tgz"
# 4. Convert the hash to SRI format:
#    nix hash to-sri --type sha256 HASH_FROM_STEP_3
# 5. Update the 'hash' field below with the SRI hash (sha256-...)
# 6. Run: devenv update && devenv shell

stdenv.mkDerivation rec {
  pname = "codex";
  version = "0.69.0";

  src = fetchurl {
    url = "https://registry.npmjs.org/@openai/codex/-/codex-${version}.tgz";
    hash = "sha256-fNYnmbBjYZy8DOnEm75tvVmNoZrz6jDvR5Dn+MtF7o4=";
  };

  nativeBuildInputs = [ makeWrapper ];
  buildInputs = [ nodejs ];

  unpackPhase = ''
    tar xzf $src
  '';

  installPhase = ''
    mkdir -p $out/lib/codex
    cp -r package/* $out/lib/codex/

    # Make bin files executable
    chmod +x $out/lib/codex/bin/codex.js

    # Create wrapper that runs codex with node
    mkdir -p $out/bin
    makeWrapper ${nodejs}/bin/node $out/bin/codex \
      --add-flags "$out/lib/codex/bin/codex.js"
  '';

  meta = with lib; {
    description = "OpenAI Codex CLI - AI-powered coding assistant";
    homepage = "https://github.com/openai/codex";
    license = licenses.asl20;
    maintainers = [ ];
    platforms = platforms.unix;
    mainProgram = "codex";
  };
}
