{ lib
, python311Packages
, fetchPypi
}:

# TinyBird CLI - Normally installed via: curl https://tinybird.co | sh
# This is a cleaner Nix-native approach

python311Packages.buildPythonApplication rec {
  pname = "tinybird";
  version = "3.0.0b50";  # Update this to the latest version from PyPI
  pyproject = true;

  src = fetchPypi {
    inherit pname version;
    # Get the hash by running: nix-prefetch-url --type sha256 <url>
    # Or let it fail first and Nix will tell you the correct hash
    hash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  };

  build-system = with python311Packages; [ setuptools ];

  # Don't run tests as they may require network/services
  doCheck = false;

  meta = with lib; {
    description = "Tinybird CLI - Analytics backend for building real-time data products";
    homepage = "https://www.tinybird.co/";
    license = licenses.asl20;
    maintainers = [ ];
    platforms = platforms.unix;
  };
}
