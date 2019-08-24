# setup-hub

This github action allows for installation of the [Github hub CLI](https://github.com/github/hub) to be used in your actions pipeline.

It has support for Linux, MacOS and Windows runners.

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@latest
- uses: geertvdc/setup-hub@master


- run: hub --version
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

# Contributions

Contributions are welcome!  See [Contributor's Guide](docs/contributors.md)
