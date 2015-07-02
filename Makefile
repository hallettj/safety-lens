.PHONY: test typecheck

test: typecheck
	babel-node node_modules/.bin/_mocha --recursive -R spec --check-leaks test/

typecheck:
	node_modules/.bin/flow
