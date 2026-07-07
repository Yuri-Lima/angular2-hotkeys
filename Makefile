.PHONY: ui build test prove serve-test-app

build:
	npx ng build angular2-hotkeys --configuration production

test:
	npx ng test angular2-hotkeys --no-watch --browsers=ChromeHeadless --code-coverage

serve-test-app:
	cd test-app && npx ng serve --port 4300 --host 127.0.0.1 --configuration development

prove:
	node scripts/prove-test-app.mjs

ui:
	bash scripts/open-ui.sh
