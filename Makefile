.PHONY: all build clean

babel     ::= node_modules/.bin/babel
src_files ::= $(shell find . -name '*.js.flow' -not -path './node_modules/*')
out_files ::= $(patsubst %.js.flow,%.js,$(src_files))

all: build

build: $(out_files)

%.js: %.js.flow
	$(babel) $< --out-file $@

clean:
	rm -f $(out_files)
