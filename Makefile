#!/usr/bin/make

SHELL := /usr/bin/bash
.DELETE_ON_ERROR:
.DEFAULT_GOAL := all

PKG_NAME=nosqless

ecmascript_version := es2024
node_version := 21.0.0
node := $(HOME)/.nvm/versions/node/v$(node_version)/bin/node
esbuild := ./node_modules/.bin/esbuild
nosqless := nosqless.js
VPATH := src
colon := :

.PHONY: run
file ?= src/$(nosqless)
run:
	$(node) $(file)

.PHONY: all
all: build

PHONY: start
start: start-mongodb

start-mongodb: var/mongodb.container

var/mongodb.container: var/mongodb.image
	docker container run --rm -d -p 27017$(colon)27017 $$(cat ./var/mongodb.image) > var/mongodb.container

var/mongodb.image: mongodb/Dockerfile mongodb/seed.js | devdirs
	cd mongodb && docker build -t $(PKG_NAME)/mongodb$(colon)dev .
	docker image ls $(PKG_NAME)/mongodb$(colon)dev -q > ./var/mongodb.image

.PHONY: stop
stop: stop-mongodb
stop-mongodb:
	if [[ -f var/mongodb.container ]]; then \
		docker rm -f $$(cat ./var/mongodb.container) 2>/dev/null; \
		rm -f var/mongodb.container; \
	fi

.PHONY: build
build: build/$(nosqless)

build/$(nosqless): $(nosqless) | buildirs
	rm -rdf build/*
	$(esbuild) $< --bundle --platform=node --target=$(ecmascript_version),node$(node_version) --outfile=$@

buildirs: ./build/
devdirs: ./var

./build/:
	mkdir ./build

./var:
	mkdir ./var
