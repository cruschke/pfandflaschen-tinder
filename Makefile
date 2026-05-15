.PHONY: install serve bootstrap test test-unit test-e2e clean

install:
	npm install
	npx playwright install --with-deps chromium webkit firefox

serve:
	npx serve . -p 3000

bootstrap:
	node scripts/bootstrap-images.js

test: test-unit test-e2e

test-unit:
	node --test tests/unit/*.test.js

test-e2e:
	npx playwright test

clean:
	rm -rf node_modules playwright-report test-results
	rm -f assets/images/*.webp
	echo '{"version":"0.0.0","items":[]}' > assets/data/bottles.json
