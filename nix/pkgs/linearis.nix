{ lib
, stdenv
, fetchFromGitHub
, nodejs
, pnpm_9
, makeWrapper
}:

# Linearis CLI - Linear.app CLI with JSON output
# Normally installed via: npm install -g --install-links czottmann/linearis
# Since dist/ is pre-built in the repo, we just need to install runtime dependencies

stdenv.mkDerivation rec {
  pname = "linearis";
  version = "0217710";  # Latest commit hash from main branch

  src = fetchFromGitHub {
    owner = "czottmann";
    repo = "linearis";
    rev = "0217710279b9c84d99e3bbfcdbc83bae3243ab37";  # Latest commit
    hash = "sha256-qC3KfSI+sMN136VlDwKQReS2tgC9EkbqaucUW2yu9H8=";
  };

  nativeBuildInputs = [ makeWrapper pnpm_9.configHook ];
  buildInputs = [ nodejs ];

  pnpmDeps = pnpm_9.fetchDeps {
    inherit pname version src;
    fetcherVersion = 2;  # Use fetcher v2 for modern pnpm lockfiles
    hash = "sha256-+d0rYzGnxW+JvDgMI49FwkGmcj+9a8/20ce0dizCVsE=";
  };

  # dist/ is already built, skip build phase
  dontBuild = true;

  installPhase = ''
    mkdir -p $out/lib/linearis
    cp -r dist node_modules package.json $out/lib/linearis/

    mkdir -p $out/bin
    makeWrapper ${nodejs}/bin/node $out/bin/linearis \
      --add-flags "$out/lib/linearis/dist/main.js"
  '';

  meta = with lib; {
    description = "Linearis - CLI tool for Linear.app with JSON output, designed for LLM agents";
    homepage = "https://github.com/czottmann/linearis";
    license = licenses.mit;
    maintainers = [ ];
    platforms = platforms.unix;
    mainProgram = "linearis";
  };
}
