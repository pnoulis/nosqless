#!/usr/bin/make

SHELL := /usr/bin/bash
.ONESHELL:
.DELETE_ON_ERROR:
.DEFAULT_GOAL := all

ecmascript_version := es2024
node_version := 21.0.0
node := $(HOME)/.nvm/versions/node/v$(node_version)/bin/node
esbuild := ./node_modules/.bin/esbuild
nosqless := nosqless.js
VPATH := src

.PHONY: run
file ?= src/$(nosqless)
run:
	$(node) $(file)


.PHONY: all
all: build

.PHONY: build
build: build/$(nosqless)

build/$(nosqless): $(nosqless) | buildirs
	rm -rdf build/*
	$(esbuild) $< --bundle --platform=node --target=$(ecmascript_version),node$(node_version) --outfile=$@

buildirs: ./build/

./build/:
	mkdir ./build
