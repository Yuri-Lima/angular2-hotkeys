.PHONY: ui build test prove serve-test-app graph lint

build:
	npx nx build angular2-hotkeys --configuration=production

test:
	npx nx test angular2-hotkeys

lint:
	npx nx lint angular2-hotkeys

serve-test-app:
	npx nx serve test-app

prove:
	node scripts/prove-test-app.mjs

graph:
	npx nx graph

ui:
	bash scripts/open-ui.sh
