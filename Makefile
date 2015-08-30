.PHONY: all build clean

babel = node_modules/.bin/babel
SRC = $(shell find src)

all: build

build: $(SRC)
	$(babel) src --out-dir .

clean:
	rm -f *.js
	rm -rf lib

node_modules: package.json
	npm install
