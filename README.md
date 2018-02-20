# fsghub

A tool for automatically opening repository web urls based on local filesystem paths.

This tool is to help keep my directory structure consistent, clean and in sync with my remote projects.

## Setup

Upon first run you will be asked for a directory to use as a base. From here the project structure should be `<user>/<project>`.

For example, my directory structure is as so:
```
~/github
~/github/jchancehud
~/github/jchancehud/fsghub
~/github/blocklease/web #an organization
```

Running `fsghub` from any of those project directories opens the github website by replacing `~/github` with `https://github.com`.

## Usage

`fsghub [path]` - Operates on current working directory with `path` appended and the entire string normalized
