{ lib
, stdenv
, fetchurl
, nodejs
, makeWrapper
}:

# Amp CLI - Normally installed via: curl -fsSL https://ampcode.com/install.sh | bash
# This is a cleaner Nix-native approach using the npm package

stdenv.mkDerivation rec {
  pname = "amp";
  version = "0.0.1760472128-gf1623f";  # Latest from npm registry

  src = fetchurl {
    url = "https://registry.npmjs.org/@sourcegraph/amp/-/amp-${version}.tgz";
    hash = "sha256-frYv9tbz9PdKN4qvcSRjqctCoRLDFid/vWis0I34iaU=";
  };

  nativeBuildInputs = [ makeWrapper ];
  buildInputs = [ nodejs ];

  unpackPhase = ''
    tar xzf $src
  '';

  installPhase = ''
    mkdir -p $out/lib/amp
    cp -r package/* $out/lib/amp/

    mkdir -p $out/bin
    makeWrapper ${nodejs}/bin/node $out/bin/amp \
      --add-flags "$out/lib/amp/dist/main.js"
  '';

  meta = with lib; {
    description = "Amp CLI - AI-powered code editor";
    homepage = "https://ampcode.com";
    license = licenses.unfree;
    maintainers = [ ];
    platforms = platforms.unix;
  };
}
