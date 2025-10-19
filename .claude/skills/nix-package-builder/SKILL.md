---
name: Nix Package Builder
description: Add custom packages to Nix devenv that don't have native Nix installers. Use when adding CLI tools, applications, or binaries to the project's Nix environment. Covers Go, npm, Python packages, and binary downloads.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Nix Package Builder

This skill helps you add custom packages to the project's Nix devenv configuration for tools that don't have native Nix packages or need custom derivations.

## Prerequisites

- Nix with flakes enabled
- Project uses devenv (check for `devenv.nix` in project root)
- Custom packages directory at `nix/pkgs/`

## Package Types & Patterns

The project has examples for different package types in `nix/pkgs/`:

1. **Go applications** → `beads.nix` - Build from source using `buildGoModule`
2. **Binary downloads** → `droid.nix` - Platform-specific pre-built binaries
3. **NPM packages** → `amp.nix` - Fetch from npm registry
4. **Python packages** → `tinybird.nix` - Build using `buildPythonApplication`

## Workflow Overview

For ANY package type, follow these steps:

1. Create `nix/pkgs/<package-name>.nix` with appropriate derivation
2. Add package to `nix/pkgs/default.nix`
3. Add package to `devenv.nix` packages list
4. (Optional) Add version check to `devenv.nix` enterShell
5. Test the build
6. Commit the changes

## Step-by-Step Instructions

### Step 1: Identify Package Type & Installation Method

First, determine what type of package you're adding:

```bash
# Check the normal installation method (usually in README or docs)
# Examples:
# - "curl install.sh | bash" → Binary download or script
# - "go install github.com/..." → Go application
# - "npm install -g @package/name" → NPM package
# - "pip install package-name" → Python package
```

### Step 2: Create Package Derivation

Choose the appropriate template based on package type:

#### For Go Applications (like beads)

**Reference**: `nix/pkgs/beads.nix`

```nix
{ lib
, buildGoModule
, fetchFromGitHub
}:

buildGoModule rec {
  pname = "package-name";
  version = "x.y.z";

  src = fetchFromGitHub {
    owner = "github-owner";
    repo = "repo-name";
    rev = "v${version}";
    hash = "sha256-PLACEHOLDER";  # Compute in next step
  };

  vendorHash = null;  # or "sha256-PLACEHOLDER" - will be determined by build

  subPackages = [ "cmd/package-name" ];  # Path to main package

  ldflags = [
    "-s"
    "-w"
    "-X main.version=${version}"
  ];

  meta = with lib; {
    description = "Brief description";
    homepage = "https://github.com/owner/repo";
    license = licenses.asl20;  # Update as needed
    maintainers = [ ];
    platforms = platforms.unix;
    mainProgram = "package-name";
  };
}
```

**Special considerations for Go packages**:
- If vendor directory exists but is out of sync: Use `proxyVendor = true;`
- `vendorHash` can be `null` or computed - build will tell you correct value
- Check `go.mod` for the correct module path

#### For Binary Downloads (like droid)

**Reference**: `nix/pkgs/droid.nix`

```nix
{ lib
, stdenv
, fetchurl
, autoPatchelfHook
}:

let
  version = "x.y.z";

  # Platform-specific download URLs
  sources = {
    x86_64-darwin = {
      url = "https://downloads.example.com/darwin/x64/binary";
      hash = "sha256-PLACEHOLDER";
    };
    aarch64-darwin = {
      url = "https://downloads.example.com/darwin/arm64/binary";
      hash = "sha256-PLACEHOLDER";
    };
    x86_64-linux = {
      url = "https://downloads.example.com/linux/x64/binary";
      hash = "sha256-PLACEHOLDER";
    };
    aarch64-linux = {
      url = "https://downloads.example.com/linux/arm64/binary";
      hash = "sha256-PLACEHOLDER";
    };
  };

  platformSources = sources.${stdenv.hostPlatform.system}
    or (throw "Unsupported system: ${stdenv.hostPlatform.system}");

  binary = fetchurl platformSources;
in
stdenv.mkDerivation {
  pname = "package-name";
  inherit version;

  dontUnpack = true;
  dontBuild = true;

  nativeBuildInputs = lib.optionals stdenv.isLinux [ autoPatchelfHook ];

  installPhase = ''
    mkdir -p $out/bin
    cp ${binary} $out/bin/package-name
    chmod +x $out/bin/package-name
  '';

  meta = with lib; {
    description = "Brief description";
    homepage = "https://example.com";
    license = licenses.unfree;
    platforms = [ "x86_64-darwin" "aarch64-darwin" "x86_64-linux" "aarch64-linux" ];
  };
}
```

#### For NPM Packages (like amp)

**Reference**: `nix/pkgs/amp.nix`

```nix
{ lib
, stdenv
, fetchurl
, nodejs
, makeWrapper
}:

stdenv.mkDerivation rec {
  pname = "package-name";
  version = "x.y.z";

  src = fetchurl {
    url = "https://registry.npmjs.org/@scope/package/-/package-${version}.tgz";
    hash = "sha256-PLACEHOLDER";
  };

  nativeBuildInputs = [ makeWrapper ];
  buildInputs = [ nodejs ];

  unpackPhase = ''
    tar xzf $src
  '';

  installPhase = ''
    mkdir -p $out/lib/package-name
    cp -r package/* $out/lib/package-name/

    mkdir -p $out/bin
    makeWrapper ${nodejs}/bin/node $out/bin/package-name \
      --add-flags "$out/lib/package-name/dist/main.js"
  '';

  meta = with lib; {
    description = "Brief description";
    homepage = "https://example.com";
    license = licenses.mit;
    platforms = platforms.unix;
  };
}
```

#### For Python Packages (like tinybird)

**Reference**: `nix/pkgs/tinybird.nix`

```nix
{ lib
, python311Packages
, fetchPypi
}:

python311Packages.buildPythonApplication rec {
  pname = "package-name";
  version = "x.y.z";
  pyproject = true;

  src = fetchPypi {
    inherit pname version;
    hash = "sha256-PLACEHOLDER";
  };

  build-system = with python311Packages; [ setuptools ];

  doCheck = false;  # Skip tests that may need network/services

  meta = with lib; {
    description = "Brief description";
    homepage = "https://example.com";
    license = licenses.asl20;
    platforms = platforms.unix;
  };
}
```

### Step 3: Compute Hashes

Hashes must be computed for source downloads. Use these commands:

#### For GitHub releases or tarballs:

```bash
# Method 1: Direct prefetch
nix-prefetch-url --unpack https://github.com/owner/repo/archive/refs/tags/vX.Y.Z.tar.gz

# This outputs a hash like: 1yz5g55kr31k3igknnngwahs6slnjas1wpqlh3gphh71m361x4a2
# Convert to SRI format:
nix hash convert --to-sri sha256:1yz5g55kr31k3igknnngwahs6slnjas1wpqlh3gphh71m361x4a2
# Outputs: sha256-QpEezKjhQHjfgBRfHrSSlmqjoeLPWjtfHDOMPEt55fs=
```

#### For npm packages:

```bash
nix-prefetch-url https://registry.npmjs.org/@scope/package/-/package-X.Y.Z.tgz
# Then convert to SRI format as above
```

#### For Go modules (vendorHash):

```bash
# Set vendorHash = "sha256-AAAA..."; in your .nix file
# Try to build - it will fail and tell you the correct hash:
nix-build -E 'with import <nixpkgs> {}; callPackage ./nix/pkgs/package.nix {}'

# Look for output like:
#   got:    sha256-dQLzUjt0CBGzTfwjWIWI4KQ34NV8KJGK4s9oPgeTO2s=
# Use that hash in your vendorHash field
```

#### For binary downloads:

```bash
# For each platform's binary:
nix-prefetch-url https://downloads.example.com/path/to/binary
# Then convert to SRI as above
```

### Step 4: Add to default.nix

Add your package to `nix/pkgs/default.nix`:

```nix
{ pkgs }:

{
  # ... existing packages ...

  # Your new package (with descriptive comment)
  # PackageName - Description
  # Normally installed via: installation command
  package-name = pkgs.callPackage ./package-name.nix { };
}
```

### Step 5: Add to devenv.nix

Add to the packages list in `devenv.nix`:

```nix
packages = [
  # ... existing packages ...

  # Custom packages
  customPkgs.package-name  # Brief description
];
```

Optionally add version check in `enterShell`:

```nix
enterShell = ''
  # ... existing code ...

  echo "Custom tools:"
  echo "  package-name: $(package-name --version 2>/dev/null || echo 'not available')"
'';
```

### Step 6: Test the Build

Test your package builds correctly:

```bash
# Test individual package build
nix-build -E 'with import <nixpkgs> {}; callPackage ./nix/pkgs/package-name.nix {}'

# If successful, test the binary
./result/bin/package-name --version

# Clean up test result
rm result

# Test full devenv (optional but recommended)
devenv shell
```

### Step 7: Commit Changes

Create a focused commit with just the Nix-related files:

```bash
# Stage only Nix files
git add nix/pkgs/package-name.nix nix/pkgs/default.nix devenv.nix devenv.lock

# Create descriptive commit
git commit -m "Add package-name to Nix devenv

- Created nix/pkgs/package-name.nix: [how it works]
- Updated nix/pkgs/default.nix: Added to custom packages
- Updated devenv.nix: Added to packages list and version check
- Updated devenv.lock: Lock file updates from rebuild

Brief description of what the package does.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Common Issues & Solutions

### Hash Mismatch Errors

**Problem**: Build fails with "hash mismatch" error

**Solution**:
1. The error will show both expected and actual hash
2. Update your `.nix` file with the actual hash shown
3. Rebuild

### Vendor Hash for Go Packages

**Problem**: Build fails with "inconsistent vendoring" or vendor errors

**Solution**:
- Set `proxyVendor = true;` to download deps instead of using vendored ones
- Set `vendorHash` to a placeholder, build will fail and tell you correct hash

### Platform-Specific Binaries Not Found

**Problem**: Binary download URL doesn't exist for your platform

**Solution**:
1. Check if binaries are actually available for all platforms
2. Update the `platforms` list in `meta` to only supported ones
3. Consider building from source instead if binaries aren't available

### Missing Dependencies

**Problem**: Build fails due to missing system libraries

**Solution**:
- For Linux binaries: Add `autoPatchelfHook` to `nativeBuildInputs`
- For other deps: Add needed packages to `buildInputs`
- Check the package's docs for required dependencies

### Version Finding

**Problem**: Not sure what version to use

**Solution**:
- Check GitHub releases: `https://github.com/owner/repo/releases`
- Check npm: `npm view @scope/package version`
- Check PyPI: `https://pypi.org/project/package-name/`
- Use `latest` tag then find the resolved version

## Tips & Best Practices

1. **Always add a comment** in the `.nix` file showing the normal installation method
2. **Reference existing examples** in `nix/pkgs/` when unsure about syntax
3. **Test the build** before committing to catch hash/dependency issues
4. **Use descriptive meta.description** to help others understand what the package does
5. **Clean up test artifacts** (remove `result` symlink) before committing
6. **Keep commits focused** on just the Nix-related changes
7. **Update devenv.lock** by rebuilding the environment

## Quick Reference

```bash
# Compute source hash
nix-prefetch-url --unpack <url>
nix hash convert --to-sri sha256:<hash>

# Test package build
nix-build -E 'with import <nixpkgs> {}; callPackage ./nix/pkgs/NAME.nix {}'

# Test binary from build
./result/bin/BINARY --version

# Rebuild devenv
devenv shell

# Clean up
rm result
```

## Related Files

- `nix/pkgs/default.nix` - Package registry
- `devenv.nix` - Main devenv configuration
- `nix/pkgs/*.nix` - Package derivations (examples)

## Examples in This Project

- **beads.nix** - Go application built from GitHub source
- **droid.nix** - Multi-platform binary downloads with dependencies
- **amp.nix** - NPM package from registry
- **tinybird.nix** - Python package from PyPI (incomplete, hash needed)

Read these files for real-world examples of each pattern.
