PROTOC ?= protoc

.SUFFIXES:

BUILDER = $(PWD)/node_modules/.bin/ulla-builder

install_mac: install

install_ubuntu: install

install:
	npm install
	npm i -S ulla-builder@next ulla-ecs@next

build: export NODE_ENV=production
build:
	$(BUILDER)
	cp -r node_modules/ulla-ecs/types types

watch_sources: export NODE_ENV=development
watch_sources:
	$(BUILDER) --watch

link-builder:
	ln -svfh ../../../ulla/packages/ulla-builder/index.js node_modules/.bin/ulla-builder

update_ulla:
	npm i -D ulla-builder@next ulla-ecs@next

# links dependencies, builds itself and expose linked module
link: update_ulla
	npm install
	$(MAKE) build
	npm link
	npm link ulla-ecs
	npm link ulla-builder

watch: watch_sources

.PHONY: build watch_sources