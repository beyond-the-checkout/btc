{ lib
, stdenv
, fetchurl
, autoPatchelfHook
}:

# Droid (Factory AI CLI) - Normally installed via: curl -fsSL https://app.factory.ai/cli | sh
# This is a cleaner Nix-native approach

let
  version = "0.19.9";

  # Platform-specific settings
  sources = {
    x86_64-darwin = {
      droid = {
        url = "https://downloads.factory.ai/factory-cli/releases/${version}/darwin/x64/droid";
        hash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
      };
      rg = {
        url = "https://downloads.factory.ai/ripgrep/darwin/x64/rg";
        hash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
      };
    };
    aarch64-darwin = {
      droid = {
        url = "https://downloads.factory.ai/factory-cli/releases/${version}/darwin/arm64/droid";
        hash = "sha256-VEZ3a2OxViHUibEtviUtxWd3ON0e/7SfNGQbXLAIPdE=";
      };
      rg = {
        url = "https://downloads.factory.ai/ripgrep/darwin/arm64/rg";
        hash = "sha256-Jz6MZQpCvuwShJEOGCW2Gj5698DOH87BN/4dbMcd77c=";
      };
    };
    x86_64-linux = {
      droid = {
        url = "https://downloads.factory.ai/factory-cli/releases/${version}/linux/x64/droid";
        hash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
      };
      rg = {
        url = "https://downloads.factory.ai/ripgrep/linux/x64/rg";
        hash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
      };
    };
    aarch64-linux = {
      droid = {
        url = "https://downloads.factory.ai/factory-cli/releases/${version}/linux/arm64/droid";
        hash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
      };
      rg = {
        url = "https://downloads.factory.ai/ripgrep/linux/arm64/rg";
        hash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
      };
    };
  };

  platformSources = sources.${stdenv.hostPlatform.system} or (throw "Unsupported system: ${stdenv.hostPlatform.system}");

  droidBinary = fetchurl platformSources.droid;
  rgBinary = fetchurl platformSources.rg;

in
stdenv.mkDerivation {
  pname = "droid";
  inherit version;

  # We're not unpacking anything, just copying binaries
  dontUnpack = true;
  dontBuild = true;

  nativeBuildInputs = lib.optionals stdenv.isLinux [ autoPatchelfHook ];

  installPhase = ''
    mkdir -p $out/bin

    # Install droid binary
    cp ${droidBinary} $out/bin/droid
    chmod +x $out/bin/droid

    # Install ripgrep binary (droid depends on it)
    cp ${rgBinary} $out/bin/rg
    chmod +x $out/bin/rg
  '';

  meta = with lib; {
    description = "Factory AI CLI (droid) - AI-powered development tool";
    homepage = "https://factory.ai";
    license = licenses.unfree;
    maintainers = [ ];
    platforms = [ "x86_64-darwin" "aarch64-darwin" "x86_64-linux" "aarch64-linux" ];
  };
}
