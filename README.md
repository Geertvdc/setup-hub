# setup-hub

[![Actions Status](https://github.com/geertvdc/setup-hub/workflows/Build%20%26%20Test/badge.svg)](https://github.com/geertvdc/setup-hub/actions)

This github action allows for installation of the [Github hub CLI](https://github.com/github/hub) to be used in your actions pipeline.

It has support for Linux, MacOS and Windows runners.

Hub CLI allows you to do more with github specific features like releases, issues and pull requests in your Github Action workflow

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@latest
- uses: geertvdc/setup-hub@master

- run: hub --version
```

Ahtorized calls to change things:
```yaml
steps:
- uses: actions/checkout@v1

- name: Install hub
    uses: geertvdc/setup-hub@master
    
- name: run hub commands
    env:
      GITHUB_USER: ${{ secrets.GITHUB_USER }}
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    run: |
         hub release
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

# Contributions

Contributions are welcome!  See [Contributor's Guide](docs/contributors.md)
