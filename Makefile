.PHONY: ui build test prove serve-test-app graph lint

build:
	pnpm exec nx build angular2-hotkeys --configuration=production

test:
	pnpm exec nx test angular2-hotkeys

lint:
	pnpm exec nx lint angular2-hotkeys

serve-test-app:
	pnpm exec nx serve test-app

prove:
	node scripts/prove-test-app.mjs

graph:
	pnpm exec nx graph

ui:
	bash scripts/open-ui.sh
